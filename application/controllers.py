from flask import (
    render_template,
    request,
    session,
    redirect,
    jsonify,
    url_for,
    send_file,
)
from flask_sqlalchemy import SQLAlchemy
from flask import current_app as app
from celery_worker import create_celery_app
from celery.result import AsyncResult
from celery.schedules import crontab
import time
from application.database import db
from application.models import *
from passlib.hash import sha256_crypt
from app import *

cel_app = create_celery_app(app)


@cel_app.task()
def add_together(a, b):
    return a + b


@app.route("/")
def home():
    return render_template("index.html", a=False)


@app.route("/register", methods=["POST"])
def user_registration():
    username = request.json.get("name")
    password = request.json.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    user = User.query.filter_by(name=username).first()
    if user:
        return jsonify({"message": "Username already exists"}), 400

    new_user = User(name=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    session["user"] = username
    return jsonify({"message": "User registered successfully"}), 200


@app.route("/register/manager", methods=["POST"])
def manager_registration():
    if "manager" in session:
        return jsonify({"message": "Already signed in as a manager"}), 400

    username = request.json.get("username")
    password = request.json.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    manager = Manager.query.filter_by(username=username).first()
    if manager:
        return jsonify({"message": "Username already exists"}), 400

    new_manager = Manager(username=username, password=password)
    db.session.add(new_manager)
    db.session.commit()

    return jsonify({"message": "Manager registered successfully"}), 200


@app.route("/login", methods=["POST"])
def login():
    try:
        username = request.json.get("username")
        password = request.json.get("password")

        user = User.query.filter_by(name=username).first()
        if user and sha256_crypt.verify(password, user.password):
            session["user"] = user.name
            return (
                jsonify({"message": "User logged in successfully", "userType": "user"}),
                200,
            )

        manager = Manager.query.filter_by(username=username).first()
        if manager and sha256_crypt.verify(password, manager.password):
            session["user"] = manager.username
            return (
                jsonify(
                    {"message": "Manager logged in successfully", "userType": "manager"}
                ),
                200,
            )

        return jsonify({"message": "Invalid username or password"}), 401
    except Exception as e:
        return (
            jsonify({"message": "Error during login: " + str(e)}),
            500,
        )  # Return a 500 Internal Server Error for debugging


@app.route("/add_to_cart/<int:category_id>/<int:product_id>", methods=["POST", "GET"])
def add_to_cart(category_id, product_id):
    if request.method == "POST":
        # Parse JSON data from the request body
        data = request.get_json()

        if not data:
            return jsonify({"message": "Invalid request. JSON data is required."}), 400

        quantity_selected = int(data.get("quantity"))

        if quantity_selected is None or not isinstance(quantity_selected, int):
            return (
                jsonify(
                    {"message": "Invalid request. Quantity must be a positive integer."}
                ),
                400,
            )

        product = Product.query.get(product_id)
        user = User.query.filter_by(name=session.get("user")).first()

        if user and product and 0 < quantity_selected <= product.quantity:
            total = product.rate * quantity_selected
            cart_item = CartItem(
                user_id=user.id,
                product_id=product_id,
                quantity=quantity_selected,
                total=total,
            )
            db.session.add(cart_item)

            # Update the product quantity
            product.quantity -= quantity_selected
            db.session.commit()
            return jsonify({"message": "Success"}), 200
        else:
            return jsonify({"message": "Invalid request or insufficient quantity"}), 400

    else:
        product = Product.query.get(product_id)
        category = Category.query.get(category_id)
        if product and category:
            product_data = {
                "product_id": product.id,
                "product_name": product.name,
                "product_unit": product.unit,
                "product_rate": product.rate,
                "product_quantity": product.quantity,
                # Add other product details here
            }

            category_data = {
                "category_id": category.id,
                "category_name": category.name,
                "category_maker": category.maker,  # Assuming you want to include the maker ID
                # Add other category details here
            }

            response_data = {
                "product": product_data,
                "category": category_data,
                "user": session.get("user"),
            }

            return jsonify(response_data), 200
        else:
            return jsonify({"message": "Product or category not found"}), 404


from flask import jsonify


@app.route("/product/<int:product_id>")
def product(product_id):
    product = Product.query.get(product_id)

    if product:
        product_data = {
            "product_id": product.id,
            "product_name": product.name,
            "product_unit": product.unit,
            "product_rate": product.rate,
            "product_quantity": product.quantity,
            # Add other product details here
        }

        response_data = {"product": product_data, "user": session.get("user")}

        return jsonify(response_data), 200
    else:
        return jsonify({"message": "Product not found"}), 404


@app.route("/cart")
def cart():
    user = User.query.filter_by(name=session.get("user")).first()
    if user:
        cart_items = CartItem.query.filter_by(user_id=user.id).all()

        # Create a list to store the cart items as dictionaries
        cart_items_data = []

        for cart_item in cart_items:
            product_name = cart_item.product.name
            found = False
            for item_data in cart_items_data:
                if item_data["product_name"] == product_name:
                    # If product already exists in the list, update quantity and total
                    item_data["quantity"] += cart_item.quantity
                    item_data["total"] += cart_item.total
                    found = True
                    break
            if not found:
                # If product does not exist, add it to the list
                cart_items_data.append(
                    {
                        "product_name": product_name,
                        "quantity": cart_item.quantity,
                        "total": cart_item.total,
                    }
                )

        # Calculate the total cost of all cart items
        total_cost = (
            sum(cart_item.total for cart_item in cart_items) if cart_items else 0
        )

        return (
            jsonify(
                {
                    "user": session.get("user"),
                    "cart_items": cart_items_data,
                    "total_cost": total_cost,
                }
            ),
            200,
        )
    else:
        return jsonify({"message": "User not found"}), 404


from datetime import datetime


@app.route("/purchase", methods=["POST"])
def purchase():
    user = User.query.filter_by(name=session["user"]).first()
    cart_items = CartItem.query.filter_by(user_id=user.id).all()

    if cart_items:
        try:
            # Create a new entry in the PurchasedProduct table for each cart item
            for cart_item in cart_items:
                purchased_product = PurchasedProduct(
                    user_id=user.id,
                    product_id=cart_item.product_id,
                    quantity=cart_item.quantity,
                    total=cart_item.total,
                    purchased_at=datetime.utcnow(),
                )
                db.session.add(purchased_product)

            # Clear the user's cart by deleting all cart items
            CartItem.query.filter_by(user_id=user.id).delete()
            db.session.commit()

            return jsonify({"message": "Purchase successful"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"message": "No items in the cart"}), 400


@app.route("/purchased_products")
def purchased_products():
    user = User.query.filter_by(name=session["user"]).first()
    purchased_products = PurchasedProduct.query.filter_by(user_id=user.id).all()

    # Create a list to store purchased product details in JSON format
    purchased_product_data = []
    for purchased_product in purchased_products:
        product = Product.query.get(purchased_product.product_id)
        if product:
            purchased_product_data.append(
                {
                    "product_name": product.name,
                    "quantity": purchased_product.quantity,
                    "total": purchased_product.total,
                    "purchased_at": purchased_product.purchased_at.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                }
            )

    return jsonify({"purchased_products": purchased_product_data}), 200


@app.route("/delete_cart", methods=["POST"])
def delete_cart():
    data = request.get_json()
    product_name_to_delete = data.get("product_name")

    if not product_name_to_delete:
        return jsonify({"message": "Invalid request. Product name is required."}), 400

    user = User.query.filter_by(name=session["user"]).first()
    cart_items_to_delete = (
        CartItem.query.filter_by(user_id=user.id)
        .join(Product)
        .filter(Product.name == product_name_to_delete)
        .all()
    )

    if cart_items_to_delete:
        for cart_item in cart_items_to_delete:
            product = Product.query.get(cart_item.product_id)
            if product:
                # Increase the product quantity back to the cart_item's quantity
                product.quantity += cart_item.quantity
                db.session.delete(cart_item)

        db.session.commit()

    return jsonify({"message": "Success"}), 200


@app.route("/logout")
def logout():
    # Clear the user's session data
    session.pop("user", None)

    return jsonify({"message": "Logedout"}), 201
