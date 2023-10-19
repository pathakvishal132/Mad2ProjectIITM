from application.models import *
from application.api2 import *

from app import cache


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
