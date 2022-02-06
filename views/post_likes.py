from flask import Response
from flask_restful import Resource
from html5lib import serialize
from models import LikePost, db
import json
from . import can_view_post
from my_decorators import post_id_is_integer_or_400_error, id_is_integer_or_400_error, test

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @post_id_is_integer_or_400_error
    def post(self, post_id):
        if not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'Like does not exist'}), mimetype="application/json", status=404)
        like = LikePost(self.current_user.id, post_id)
        db.session.add(like)
        db.session.commit()
        return Response(json.dumps(like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, post_id, id):
        try:
            int(post_id)
            int(id)
        except:
            return Response(
                json.dumps({'message': '{0} must be an integer.'.format(id)}), 
                mimetype="application/json", 
                status=400
            )
        like = LikePost.query.get(id)
        if not like or like.user_id != self.current_user.id or not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'Like does not exist'}), mimetype="application/json", status=404)

        LikePost.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Like {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/<post_id>/likes', 
        '/api/posts/<post_id>/likes/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/<post_id>/likes/<id>', 
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
