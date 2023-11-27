"""Python Flask WebApp Auth0 integration example
"""

from http import cookies
import json
from os import environ as env
from urllib.parse import quote_plus, urlencode

from authlib.integrations.flask_client import OAuth
from dotenv import find_dotenv, load_dotenv
from flask import Flask, make_response, redirect, render_template, session, url_for

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

app = Flask(__name__)
app.secret_key = env.get("APP_SECRET_KEY")


oauth = OAuth(app)

oauth.register(
    "auth0",
    client_id=env.get("AUTH0_CLIENT_ID"),
    client_secret=env.get("AUTH0_CLIENT_SECRET"),
    client_kwargs={
        "scope": "openid profile email",
    },
    server_metadata_url=f'https://{env.get("AUTH0_DOMAIN")}/.well-known/openid-configuration',
)


# Controllers API
@app.route("/")
def home():
    return render_template(
        "home.html",
        session=session.get("user"),
        pretty=json.dumps(session.get("user"), indent=4),
    )


@app.route("/callback", methods=["GET", "POST"])
def callback():
    token = oauth.auth0.authorize_access_token()
    session["user"] = token
    response = make_response(redirect('http://localhost:5173'))
    user_info = token['userinfo']
    user_id = user_info['sub']
    user_token = token['access_token']
    return manage_cookies(response, set_cookies={'user_id': user_id, 'user_token': user_token})


@app.route("/login")
def login():
    return oauth.auth0.authorize_redirect(
        redirect_uri=url_for("callback", _external=True)
    )


@app.route("/logout")
def logout():
    session.clear()
    response = make_response(redirect('http://localhost:5173'))
    return manage_cookies(response, clear_cookies=['user_id', 'user_token'])

def manage_cookies(response, set_cookies={}, clear_cookies=[]):
    """Sets and clears cookies."""
    for name, value in set_cookies.items():
        response.set_cookie(name, value)
    for name in clear_cookies:
        response.set_cookie(name, expires=0)
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=env.get("PORT", 3000))
