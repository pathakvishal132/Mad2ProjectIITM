from flask import Flask
from application.database import db
from flask_cors import CORS
from flask_restful import Api

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite3"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = "secret"
    db.init_app(app)

    app.app_context().push()

    return app


app = create_app()

from application.controllers import *
from application.api2 import *

api2 = Api(app)


api2.add_resource(
    UserRegistrationResource,
    "/api/user",
)
api2.add_resource(
   ManagerRegistrationResource, "/api/manager", 
)
api2.add_resource(
    CategoryResource, "/api/category", "/api/category/<int:cat_id>", endpoint="category"
)
api2.add_resource(
    ProductAPI,
    "/api/product",
    '/api/product/<int:category_id>',
    "/api/product/del/<int:product_id>",
)

# You would add this resource to your Flask API
api2.add_resource(CartItemAPI, "/api/cart_item", "/api/cart_item/<int:cart_item_id>")



# You would add this resource to your Flask API
api2.add_resource(
    PurchasedProductAPI,
    "/api/purchased_product",
    
    "/api/purchased_product/<int:purchased_product_id>",
)


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
