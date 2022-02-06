from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json
from my_decorators import handle_db_insert_error

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        data = Following.query.filter(Following.user_id == self.current_user.id).all()

        data = [
            item.to_dict_following() for item in data
        ]
        return Response(json.dumps(data), mimetype="application/json", status=200)

    @handle_db_insert_error
    def post(self):
        body = request.get_json()
        user_id = body.get('user_id')
        try:
            int(user_id)
        except:
            return Response(
            json.dumps({'message': '{0} must be an integer.'.format(user_id)}), 
            mimetype="application/json", 
            status=400
            )
        if not User.query.get(user_id):
            return Response(json.dumps({'message': 'User does not exist'}), mimetype="application/json", status=404)

        following = Following(self.current_user.id, user_id)
        db.session.add(following)
        db.session.commit()
        return Response(json.dumps(following.to_dict_following()), mimetype="application/json", status=201)


class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # Your code here
        return Response(json.dumps({}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
