import Model from './model.js';

export default class Post extends Model {
    constructor() {
        super(true);
        //true dans le constructeur permet de créer un Id sécurisé
        //this.addField('Id', 'string'); //rajouter sécurisé
        this.addField('Title', 'string');
        this.addField('Text', 'string');
        this.addField('Category', 'string');
        this.addField('Image', 'asset');
        this.addField('Creation', 'integer');
        this.setKey("Title");
    }
    /*
    bindExtraData(instance) {
        instance = super.bindExtraData(instance);
        this.addField('Creation', 'integer');
        instance.Creation = Date.now();
        return instance;
    }
    */
}