import PostsModel from '../models/posts.js';
import Repository from '../models/repository.js';
import Controller from './Controller.js';

export default class PostsController extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new PostsModel()));
    }
}