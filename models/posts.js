export default class Posts extends Model {
    constructor() {
        super(true);
        //true dans le constructeur permet de créer un Id sécurisé
        //this.addField('Id', 'string'); //rajouter sécurisé
        this.addField('Title', 'string');
        this.addField('Text', 'string');
        this.addField('Category', 'string');
        this.addField('Image', 'asset');
        this.addField('Creation', 'integer');
        this.setKey("Id");
    }
}