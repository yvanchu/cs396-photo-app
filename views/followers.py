from flask import Response, request
from flask_restful import Resource
from models import Following
import json
import flask_jwt_extended

def get_path():
    return request.host_url + 'api/posts/'

class FollowerListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        data = Following.query.filter(Following.following_id == self.current_user.id).all()

        data = [
            item.to_dict_follower() for item in data
        ]
        return Response(json.dumps(data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowerListEndpoint, 
        '/api/followers', 
        '/api/followers/', 
        resource_class_kwargs={'current_user':flask_jwt_extended.current_user }
    )
