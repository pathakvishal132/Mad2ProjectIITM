from flask import Flask, request
from flask_restful import (
    Resource,
    fields,
    marshal_with,
    request,
    reqparse,
    Api,
    marshal,
)
import base64

from functools import wraps
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from application.models import *
from application.database import db
from flask import current_app as app
from flask_restful import Resource, reqparse
from passlib.hash import sha256_crypt

user_fields = {
    "id": fields.Integer,
    "name": fields.String,
}


def check_basic_auth(username, password):
    # Retrieve the manager's username and password from the database
    manager = Manager.query.filter_by(username=username).first()

    # Check if the username exists in the database
    if manager is not None:
        # Verify the provided password against the stored password hash
        if sha256_crypt.verify(password, manager.password):
            return True  # Authentication successful

    return False  # Authentication failed


def basic_auth_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return {"message": "Authentication required"}, 401

        try:
            auth_type, auth_string = auth_header.split()
            if auth_type.lower() != "basic":
                raise ValueError

            decoded_auth = base64.b64decode(auth_string).decode("utf-8")
            username, password = decoded_auth.split(":")

            if not check_basic_auth(username, password):
                raise ValueError

        except (ValueError, UnicodeDecodeError):
            return {"message": "Invalid credentials"}, 401

        return func(*args, **kwargs)

    return decorated


class UserRegistrationResource(Resource):
    def get(self):  # worked
        users = User.query.all()
        if not users:
            return {"message": "No users found"}, 404
        user_list = [marshal(user, user_fields) for user in users]

        return {"users": user_list}, 200

    def post(self):  # worked
        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str, required=True)
        parser.add_argument("password", type=str, required=True)

        args = parser.parse_args()
        a_name = args["name"]
        a_pass = args["password"]
        u_name = User(name=a_name, password=a_pass)
        db.session.add(u_name)
        db.session.commit()
        return {"msg": "success"}, 201
class ManagerRegistrationResource(Resource):
    def get(self):
        # Query the database to retrieve a list of registered managers
        managers = Manager.query.all()

        # Check if there are no managers registered
        if not managers:
            return {"message": "No managers found"}, 404

        # Serialize the list of managers into a JSON response
        manager_list = [{"username": manager.username} for manager in managers]

        return {"managers": manager_list}, 200
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("username", type=str, required=True)
        parser.add_argument("password", type=str, required=True)

        args = parser.parse_args()
        username = args["username"]
        password = args["password"]

        # Check if a manager with the same username already exists
        existing_manager = Manager.query.filter_by(username=username).first()
        if existing_manager:
            return {"message": "Username already exists"}, 400

        # Create a new manager
        new_manager = Manager(username=username, password=password)
        db.session.add(new_manager)
        db.session.commit()

        return {"message": "Manager registered successfully"}, 201

# Define JSON fields for Category
category_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "maker": fields.Integer,
}

class CategoryResource(Resource):
    @marshal_with(category_fields)  # worked
    def get(self):
        category = Category.query.all()
        if not category:
            return {"message": "Category not found"}, 404
        return category, 200

    @marshal_with(category_fields)
    def post(self):
        # Apply the decorator here
        @basic_auth_required
        def protected_post():
            parser = reqparse.RequestParser()
            parser.add_argument(
                "name", type=str, required=True, help="Category name is required."
            )
            parser.add_argument(
                "maker", type=int, required=True, help="Maker ID is required."
            )
            args = parser.parse_args()

            new_category = Category(name=args["name"], maker=args["maker"])
            db.session.add(new_category)
            db.session.commit()
            return new_category, 201

        return protected_post()

    @marshal_with(category_fields)
    def put(self, cat_id):
        # Apply the decorator here
        @basic_auth_required
        def protected_put():
            category = Category.query.get(cat_id)
            if not category:
                return {"message": "Category not found"}, 404

            parser = reqparse.RequestParser()
            parser.add_argument(
                "name", type=str, required=True, help="Category name is required."
            )
            parser.add_argument(
                "maker", type=int, required=True, help="Maker ID is required."
            )
            args = parser.parse_args()

            category.name = args["name"]
            category.maker = args["maker"]
            db.session.commit()
            return category, 200

        return protected_put()

    def delete(self, cat_id):
        # Apply the decorator here
        @basic_auth_required
        def protected_delete():
            category = Category.query.get(cat_id)
            if not category:
                return {"message": "Category not found"}, 404

            db.session.delete(category)
            db.session.commit()
            return {"message": "Category deleted successfully"}, 204

        return protected_delete()


product_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "unit": fields.String,
    "rate": fields.Float,
    "quantity": fields.Integer,
    "parent": fields.Integer,
}


class ProductAPI(Resource):
    @marshal_with(product_fields)
    def get(self):
        products = Product.query.all()
        if not products:
            return {"message": "No products found for this category"}, 404
            
        return products

    @marshal_with(product_fields)
    @basic_auth_required  # Apply the decorator here
    def post(self):
        # Your existing post method code
        # ...
        # Parse request data
        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str, required=True)
        parser.add_argument("unit", type=str, required=True)
        parser.add_argument("rate", type=float, required=True)
        parser.add_argument("quantity", type=int, required=True)
        parser.add_argument("parent", type=int, required=True)
        args = parser.parse_args()

        # Check if the product already exists
        existing_product = Product.query.filter_by(name=args["name"]).first()

        if existing_product:
            return {"message": "Product already exists"}, 400

        # Create a new product
        new_product = Product(
            name=args["name"],
            unit=args["unit"],
            rate=args["rate"],
            quantity=args["quantity"],
            parent=args["parent"],
        )

        db.session.add(new_product)
        db.session.commit()

        return new_product

    @marshal_with(product_fields)
    @basic_auth_required  # Apply the decorator here
    def put(self, category_id):
        # Your existing put method code
        # ...
        # Parse request data
        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str, required=True)
        parser.add_argument("unit", type=str, required=True)
        parser.add_argument("rate", type=float, required=True)
        parser.add_argument("quantity", type=int, required=True)
        parser.add_argument("parent", type=int, required=True)

        args = parser.parse_args()

        # Update the product
        product = Product.query.get(category_id)
        if not product:
            return {"message": "Product not found"}, 404

        product.name = args["name"]
        product.unit = args["unit"]
        product.rate = args["rate"]
        product.quantity = args["quantity"]
        product.parent = args["parent"]

        db.session.commit()

        return product

    @basic_auth_required  # Apply the decorator here
    def delete(self, product_id):
        # Your existing delete method code
        # ...
        product = Product.query.get(product_id)
        if not product:
            return {"message": "Product not found"}, 404

        db.session.delete(product)
        db.session.commit()

        return {"message": "Product deleted"}, 200


cart_item_fields = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "product_id": fields.Integer,
    "quantity": fields.Integer,
    "total": fields.Integer,
}


class CartItemAPI(Resource):
    @marshal_with(cart_item_fields)  # worked
    def get(self):
        cart_item = CartItem.query.all()
        if not cart_item:
            return {"message": "Cart item not found"}, 404
        return cart_item


purchased_product_fields = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "product_id": fields.Integer,
    "quantity": fields.Integer,
    "total": fields.Float,
    "purchased_at": fields.DateTime(dt_format="iso8601"),  # Use the appropriate format
}


class PurchasedProductAPI(Resource):
    @marshal_with(purchased_product_fields)
    def get(self):  # worked
        purchased_product = PurchasedProduct.query.all()
        if not purchased_product:
            return {"message": "Purchased product not found"}, 404
        return purchased_product
