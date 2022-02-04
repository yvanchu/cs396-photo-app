from flask import Response
from flask_restful import Resource
from models import Story
from . import get_authorized_user_ids
import json

class StoriesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        authorized_user_ids = [*get_authorized_user_ids(self.current_user), self.current_user.id]
        data = Story.query.filter(Story.user_id.in_(authorized_user_ids)).all()
        data = [ item.to_dict() for item in data ]
        return Response(json.dumps(data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        StoriesListEndpoint, 
        '/api/stories', 
        '/api/stories/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
