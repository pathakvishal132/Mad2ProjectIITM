from flask import render_template, request, session, redirect, jsonify, url_for,send_file
from flask_sqlalchemy import SQLAlchemy
from flask import current_app as app
from celery_worker import make_celery
from celery.result import AsyncResult
from celery.schedules import crontab
import time
from application.database import db
from application.models import *
from passlib.hash import sha256_crypt



@app.route("/")
def home():
    return render_template("index.html",a = False)













# @app.route("/getallposts")
# def get_all_posts():
#     blogs = Blog.query.all()  # get all the objects for the blog model
#     data = []
#     for blog in blogs:
#         data.append({
#             'id': blog.id,
#             'title': blog.title,
#             'description': blog.description
#         })
#     print("data:", data)
#     return data


# @app.route("/createblog", methods=['POST'])
# def create_blog():
#     data = request.get_json()
#     print("Post Title:", data.get("title"),
#           "Post Description:", data.get("desc"))
#     blog = Blog(title=data.get("title", None),
#                 description=data.get("desc", None))
#     db.session.add(blog)
#     db.session.commit()
#     return jsonify("Post successfully added")


# @app.route("/updateblog/<id>", methods=['POST'])
# def update_blog(id):
#     # For form --> request.form['parameter'] --> request.files['file']
#     data = request.get_json()
#     print("Post Title:", data.get("title"),
#           "Post Description:", data.get("desc"))
#     blog = Blog.query.get(id)
#     blog.title = data.get("title")
#     blog.description = data.get("desc")
#     db.session.commit()
#     return jsonify("Post successfully updated")


# @app.route("/deleteblog/<id>")
# def delete_blog(id):
#     blog = Blog.query.get(id)
#     db.session.delete(blog)
#     db.session.commit()
#     return jsonify("Card deleted...")

# @app.route("/trigger-celery-job")
# def trigger_celery_job():
#     a = generate_csv.delay()
#     return {
#         "Task_ID" : a.id,
#         "Task_State" : a.state,
#         "Task_Result" : a.result
#     }



