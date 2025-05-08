"""
Routes package - imports all route modules to register them with the app
"""

from flask import Blueprint
from .authentication import *
from .staff import *
from .resource_types import *
from .transactions import *
from .readers import *
from .resources import *
from .statistics import *
from .logs import *
from .user_authentication import *
from .late_returns import late_returns_bp

def register_blueprints(app):
    # Register blueprints
    app.register_blueprint(late_returns_bp, url_prefix='/api')