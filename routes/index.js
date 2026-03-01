var dotenv = require('dotenv').config();
var express = require('express');
var router = express.Router();
var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: (process.env.sqlhost),
        user: (process.env.sqluser),
        password: (process.env.sqlpassword),
        database: (process.env.sqldatabase)
    }
});
var prod = process.env.production;

function parseJsonArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        var parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function pickImageUrl(imageValue) {
    if (!imageValue) return '';
    if (typeof imageValue === 'string') return imageValue;
    if (typeof imageValue === 'object') {
        return imageValue.url || imageValue.s1600 || imageValue.s800 || imageValue.s128 || '';
    }
    return '';
}

/* GET home page. */
router.get('/', function (req, res, next) {
    var projects;
    knex('projects').select('*').then(function (resp) {
        projects = resp;
        res.render('index', { title: 'Home', prod: prod, projects: projects, currentPage: 'home' });
    });
});

router.get('/route/:slug', function (req, res, next) {
    var routeslug = req.params.slug;
    var results;
    knex('table').select('*').where('slug', routeslug).then(function (resp) {
        results = resp[0];
        res.render('template', { title: title, results: results });
    });
});

// Route for /info
router.get('/info', function (req, res, next) {
    Promise.all([
        knex('bio').select('*').first(),
        knex('contact').select('*').first()
    ]).then(function (results) {
        var bio = results[0] || {};
        var contact = results[1] || {};

        res.render('info', {
            title: 'Info',
            bio: bio,
            contact: contact,
            prod: prod,
            currentPage: 'info'
        });
    }).catch(next);
});

// Route for /projects
router.get('/projects', function (req, res, next) {
    knex('projects').select('*').orderBy('order', 'asc').then(function (projects) {
        var normalizedProjects = projects.map(function (project) {
            var parsedImages = parseJsonArray(project.images);
            var galleryImages = parsedImages.map(pickImageUrl).filter(Boolean);

            return Object.assign({}, project, {
                gallery_images: galleryImages
            });
        });

        // Debug output for gallery shape
        console.log('Projects gallery payload sample (JSON):', JSON.stringify(normalizedProjects.map(function (p) {
            return {
                id: p.id,
                title: p.title,
                images_raw: p.images,
                gallery_images: p.gallery_images
            };
        }), null, 2));

        res.render('projects', {
            title: 'Projects',
            prod: prod,
            currentPage: 'projects',
            projects: normalizedProjects
        });
    }).catch(next);
});

module.exports = router;