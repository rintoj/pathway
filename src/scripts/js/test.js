var db = new PouchDB('pathway');

db.sync('http://localhost/couchdb/pathway').on('complete', function () {
	console.log("Done!");
}).on('error', function (err) {
	console.error(err);
});

db.changes({
	since: 'now',
	live: true,
	include_docs: true
}).on('change', function (change) {
	console.log(change);
}).on('error', function (err) {
	console.err(err);
});
