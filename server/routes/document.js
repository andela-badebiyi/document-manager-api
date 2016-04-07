var middleware = require('../middleware/middlewares');
var documentRoutes = require('../controllers/documentController');

module.exports = function(router){
	//create a document
	router.post('/documents', documentRoutes.create);

	//fetch all documents with limit
	router.get('/documents/fetch/:limit', documentRoutes.get);

	//fetch all documents
	router.get('/documents/', documentRoutes.getAll);

	//fetch documents by datecreated
	router.get('/documents/:date/:limit', documentRoutes.documentsByDate);

	//fetch a single document
	router.get('/documents/:id', documentRoutes.getDocument);

	//delete a document by document_id
	router.delete('/documents/:id', middleware.allowedToModify, documentRoutes.deleteDocument);

	//update a document by id
	router.patch('/documents/:id', middleware.allowedToModify, documentRoutes.updateDocument);

	//fetch user documents
	router.get('/users/:username/documents', documentRoutes.getUserDocuments);
};