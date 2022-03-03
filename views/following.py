from flask import Response, request
from flask_restful import Resource
from models import Following, User, db, following
import json
from my_decorators import handle_db_insert_error
import flask_jwt_extended
from views import security

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        data = Following.query.filter(Following.user_id == self.current_user.id).all()
        # if not data:
        #     return Response(json.dumps({'message': 'User does not exist'}), mimetype="application/json", status=404)
        data = [
            item.to_dict_following() for item in data
        ]
        return Response(json.dumps(data), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
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
        try:
            db.session.add(following)
            db.session.commit()
        except:
            return Response(json.dumps({'message': 'Error committing to database'}), mimetype="application/json", status=400)
        return Response(json.dumps(following.to_dict_following()), mimetype="application/json", status=201)


class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    @security.id_is_valid
    def delete(self, id):
        # try:
        following = Following.query.get(id)
        if not following:
            return Response(json.dumps({'message': 'Following does not exist'}), mimetype="application/json", status=404)
        elif following.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'User not authorized'}), mimetype="application/json", status=404)
        Following.query.filter_by(id=id).delete()
        db.session.commit()
        # except:
        #     return Response(json.dumps({'message': 'User does not exist'}), mimetype="application/json", status=404)
        serialized_data = {
            'message': 'Following {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
