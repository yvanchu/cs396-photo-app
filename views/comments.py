from flask import Response, request
from flask_restful import Resource
from . import can_view_post
import json
from models import db, Comment, Post
from my_decorators import id_is_integer_or_400_error, handle_db_insert_error

class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @handle_db_insert_error
    def post(self):
        body = request.get_json()
        post_id = body.get('post_id')
        if len(Post.query.filter_by(id=post_id).all()) == 0 or not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)

        text = body.get('text')

        comment = Comment(text, self.current_user.id, post_id)
        db.session.add(comment)
        db.session.commit()
        return Response(json.dumps(comment.to_dict()), mimetype="application/json", status=201)
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
  
    @id_is_integer_or_400_error
    def delete(self, id):
        comment = Comment.query.get(id)
        if not comment or comment.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)

        Comment.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Post {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': api.app.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<id>', 
        '/api/comments/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
