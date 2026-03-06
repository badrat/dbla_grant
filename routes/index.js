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
var DEFAULT_META_IMAGE = '/images/og_image_1200x630.png';

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

function slugifyText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function normalizeProjectSlug(rawSlug, title) {
    var slug = String(rawSlug || '').trim();

    if (!slug && title) {
        slug = slugifyText(title);
    }

    slug = slug
        .replace(/^https?:\/\/[^/]+/i, '')
        .replace(/^\/+|\/+$/g, '')
        .replace(/^projects?\//i, '');

    return slug || slugifyText(title);
}

function normalizeProject(project) {
    var parsedImages = parseJsonArray(project.images);
    var galleryImages = parsedImages.map(pickImageUrl).filter(Boolean);
    var slugSegment = normalizeProjectSlug(project.slug, project.title) || ('project-' + String(project.id || 'item'));

    return Object.assign({}, project, {
        gallery_images: galleryImages,
        slug_segment: slugSegment,
        project_path: '/project/' + slugSegment
    });
}

// Load project menu items for sidebar on every request
router.use(function (req, res, next) {
    knex('projects').select('*').orderBy('order', 'asc').then(function (projects) {
        res.locals.projectMenuItems = projects.map(normalizeProject);
        next();
    }).catch(next);
});

/* GET home page. */
router.get('/', function (req, res, next) {
    var normalizedProjects = res.locals.projectMenuItems || [];
    res.render('index', { title: 'Home', prod: prod, projects: normalizedProjects, currentPage: 'home', currentProjectSlug: '' });
});

router.get('/route/:slug', function (req, res, next) {
    var routeslug = req.params.slug;
    var results;
    knex('table').select('*').where('slug', routeslug).then(function (resp) {
        results = resp[0];
        res.render('template', { title: title, results: results });
    });
});

// Route for /links
router.get('/links', function (req, res, next) {
    res.render('links', {
        title: 'Links',
        prod: prod,
        currentPage: 'links',
        currentProjectSlug: ''
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
            currentPage: 'info',
            currentProjectSlug: ''
        });
    }).catch(next);
});

// Route for /projects
router.get('/projects', function (req, res, next) {
    var normalizedProjects = res.locals.projectMenuItems || [];
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
        projects: normalizedProjects,
        projectMenuItems: normalizedProjects,
        currentProjectSlug: '',
        metaThumbnail: DEFAULT_META_IMAGE
    });
});

// Route for /project/:projectSlug
router.get('/project/:projectSlug', function (req, res, next) {
    var requestedSlug = normalizeProjectSlug(req.params.projectSlug, '');
    var normalizedProjects = res.locals.projectMenuItems || [];
    var project = normalizedProjects.find(function (item) {
        return item.slug_segment === requestedSlug;
    });

    if (!project) {
        return res.status(404).render('error');
    }

    res.render('project', {
        title: project.title || 'Project',
        prod: prod,
        currentPage: 'projects',
        currentProjectSlug: project.slug_segment,
        projectMenuItems: normalizedProjects,
        project: project,
        metaThumbnail: project.thumbnail || DEFAULT_META_IMAGE
    });
});

module.exports = router;