const router = require('express').Router()
const { signup, login, userUpdate, userDelete } = require('../controllers/AuthController');
const { createShortenedUrl,  getUserUrls,clickAndTrack,updateOriginalUrl,deleteShortenedUrl,GetUserClicks,  } = require('../controllers/LinkController');


// Signup Route
router.post('/signup', signup )

  // Login Route
 router.post('/login', login)

//  update user

router.put('/user/update', userUpdate)

// user delete

router.delete('/user/delete', userDelete)

//  Create Link
router.post('/create',createShortenedUrl )

// userurls
router.get('/user/urls', getUserUrls)

// get clickAndTrack
router.get('/:shortenedUrl', clickAndTrack)
// update original link




router.put('/update/:shortenedUrl', updateOriginalUrl)

// delete original link

router.delete('/delete/:shortenedUrl', deleteShortenedUrl)

// get userclicks on dashbaord

router.get('/user/clicks', GetUserClicks)






  module.exports = router;
