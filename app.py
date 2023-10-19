from flask import (
    render_template,
    request,
    session,
    Flask,
    redirect,
    jsonify,
    url_for,
    send_file,
)
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import smtplib
from flask import jsonify
from io import StringIO
import csv
from flask_cors import CORS
from flask_restful import Api
from application.database import db
from application.models import *
from celery_worker import make_celery
from flask_caching import Cache
from application.api2 import (
    UserRegistrationResource,
    ManagerRegistrationResource,
    CategoryResource,
    ProductAPI,
    CartItemAPI,
)

from flask_caching import Cache
import smtplib

from celery.result import AsyncResult
from celery.schedules import crontab
import time
from json import dumps
from httplib2 import Http

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite3"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = "secret"
app.config["CACHE_TYPE"] = "RedisCache"
app.config["CACHE_DEFAULT_TIMEOUT"] = 30
app.config["CACHE_REDIS_URL"] = "redis://localhost:6379/2"
app.config.update(
    CELERY_BROKER_URL="redis://localhost:6379",
    CELERY_RESULT_BACKEND="redis://localhost:6379",
)
db.init_app(app)
celery = make_celery(app)
cache = Cache(app)
api2 = Api(app)

# Routes
api2.add_resource(UserRegistrationResource, "/api/user")
api2.add_resource(ManagerRegistrationResource, "/api/manager")
api2.add_resource(
    CategoryResource, "/api/category", "/api/category/<int:cat_id>", endpoint="category"
)
api2.add_resource(
    ProductAPI,
    "/api/product",
    "/api/product/<int:category_id>",
    "/api/product/del/<int:product_id>",
)
api2.add_resource(CartItemAPI, "/api/cart_item", "/api/cart_item/<int:cart_item_id>")


@cache.cached(timeout=50, key_prefix="get_all_products")
def get_all_products():
    products = Product.query.all()
    return products


@cache.cached(timeout=60, key_prefix="get_product_by_id")
def get_product_by_id(product_id):
    p = Product.query.get(product_id)
    return p


@cache.cached(timeout=60, key_prefix="get_category_by_id")
def get_category_by_id(category_id):
    c = Category.query.get(category_id)
    return c


@cache.cached(timeout=60, key_prefix="get_user_by_name")
def get_user_by_name(u_name):
    u = User.query.filter_by(name=u_name).first()
    return u


@cache.cached(timeout=60, key_prefix="get_user_by_id")
def get_user_by_id(u_id):
    u = User.query.filter_by(id=id).first()
    return u


@cache.cached(timeout=60, key_prefix="get_cartItem_by_user_id")
def get_cartItem_by_user_id(u_id):
    x = CartItem.query.filter_by(user_id=u_id)
    return x


@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls test('hello') every 10 seconds.
    sender.add_periodic_task(30.0, send_reminder_via_email.s(), name="30 sec reminder")


@celery.on_after_configure.connect
def setup_periodic_tasks2(sender, **kwargs):
    sender.add_periodic_task(30.0, send_reminder.s(), name="30 sec reminder")


@celery.task
def send_reminder_via_email():
    send_email(
        to_address="random1@gmail.com",
        subject="main",
        message="Random",
        content="text",
    )
    return "Successful"


SMTP_SERVER_HOST = "localhost"
SMTP_SERVER_PORT = 1025
SENDER_ADDRESS = "random@gmail.com"
SENDER_PASSWORD = ""


def send_email(
    to_address,
    subject,
    message,
    content="text",
    attachment_file=None,
):
    # Create an instance of MIMEMultipart
    msg = MIMEMultipart()
    msg["From"] = SENDER_ADDRESS
    msg["To"] = to_address
    msg["Subject"] = subject

    # Check the content type
    if content == "html":
        msg.attach(MIMEText(message, "html"))
    else:
        msg.attach(MIMEText(message, "plain"))

    # Check if there's an attachment
    if attachment_file:
        with open(attachment_file, "rb") as attachment:
            # Add file as application/octet-stream
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment.read())
            encoders.encode_base64(part)

            msg.attach(part)

    # Connect to the SMTP server
    server = smtplib.SMTP(host=SMTP_SERVER_HOST, port=SMTP_SERVER_PORT)
    # server.starttls()
    server.login(SENDER_ADDRESS, SENDER_PASSWORD)

    # Send the email
    # server.sendmail(SENDER_ADDRESS, to_address, msg.as_string())
    server.quit()

    return True


@celery.task()
def add(a, b):
    time.sleep(5)
    return a + b


@app.route("/download-file")
def download_file():
    return send_file("static/product.csv")


@celery.task
def send_reminder():
    WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAAAkugwTZk/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=KmqHrMqC1SKqq1Dyb-Ab7mZ7SVnpJE7dAMRhUHW6TqI"

    """Google Chat incoming webhook quickstart."""
    url = WEBHOOK_URL
    app_message = {"text": "Please Purchase from GreenMarket Thankyou"}
    message_headers = {"Content-Type": "application/json; charset=UTF-8"}
    http_obj = Http()
    response = http_obj.request(
        uri=url, method="POST", headers=message_headers, body=dumps(app_message)
    )
    print(response)
    return "reminder will be sent shortly"


@celery.task
def generate_csv():
    import csv

    # Retrieve product data from the database
    products = get_all_products()

    if not products:
        return "No products found."

    # Define the CSV file path
    csv_file_path = "static/product.csv"

    # Define the CSV field names
    fields = ["id", "name", "unit", "rate", "quantity", "parent"]

    # Prepare the data rows
    rows = []
    for product in products:
        row = [
            product.id,
            product.name,
            product.unit,
            product.rate,
            product.quantity,
            product.parent,
        ]
        rows.append(row)

    # Write the data to the CSV file
    with open("static/product.csv", "w") as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(fields)
        csvwriter.writerows(rows)

    return "executed"


@app.route("/trigger_celery_job")
def trigger_celery_job():
    a = generate_csv.delay()
    return {"Task_ID": a.id, "Task_State": a.state, "Task_Result": a.result}


@app.route("/status/<id>")
def check_status(id):
    res = AsyncResult(id, app=celery)
    return {"Task_ID": res.id, "Task_State": res.state, "Task_Result": res.result}


@app.route("/create_category", methods=["POST"])
def create_category():
    if request.method == "POST":
        data = request.get_json()
        print(data)
        category_name = data.get("category_name")

        if not category_name:
            return jsonify({"message": "Category name is required"}), 400

        manager = Manager.query.filter_by(username=session.get("user")).first()
        if manager:
            category = Category(name=category_name, creator=manager)
            db.session.add(category)
            db.session.commit()
            return jsonify({"message": "Category created successfully"}), 201
        else:
            return jsonify({"message": "Manager not found"}), 404

    return jsonify({"message": "Invalid request method"}), 405


@app.route("/")
def home():
    return render_template("index.html", a=False)


@app.route("/register", methods=["POST"])
def user_registration():
    username = request.json.get("name")
    password = request.json.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    user = get_user_by_name(username)
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

        user = get_user_by_name(username)
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

        product = get_product_by_id(product_id)  # cache
        user = get_user_by_name(session.get("user"))

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
        product = get_product_by_id(product_id)  # cache
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


@app.route("/product/<int:product_id>")
def product(product_id):
    product = get_product_by_id(product_id)  # cache

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
    user = get_user_by_name(session.get("user"))
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

from flask import jsonify


@app.route("/delete_prod/<int:product_id>", methods=["POST"])
def delete_product(product_id):
    if request.method == "POST":
        with app.app_context():
            product = get_product_by_id(product_id)

            if product:
                db.session.delete(product)
                db.session.commit()
                return jsonify({"message": "Product deleted successfully"}), 200
            else:
                return jsonify({"message": "Product not found"}), 404


@app.route("/delete_cart", methods=["POST"])
def delete_cart():
    if request.method == "POST":
        data = request.get_json()
        print(data)
        product_name_to_delete = data.get("product_name")

        if not product_name_to_delete:
            return (
                jsonify({"message": "Invalid request. Product name is required."}),
                400,
            )

        user = get_user_by_name(session["user"])  # cached
        cart_items_to_delete = (
            get_cartItem_by_user_id(user.id)
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
        print("llll")
        return jsonify({"message": "Success"}), 200


@app.route("/logout")
def logout():
    # Clear the user's session data
    session.pop("user", None)

    return jsonify({"message": "Logedout"}), 201


if __name__ == "__main__":
    app.app_context().push()
    db.create_all()
    app.run(debug=True)
