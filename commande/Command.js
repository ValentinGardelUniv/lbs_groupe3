module.exports= class Command {
    constructor(id, mail_client, date_commande, montant){
        this.id=id;
        this.mail_client=mail_client;
        this.date_commande=date_commande;
        this.montant=montant;
    }

    toJson(){
        return JSON.parse(this);
    }
}