const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}
module.exports.register = async (req, res, next) => {
    try {
        const {username, email, password} = req.body;
        const user = new User({username, email});
        const registeredUser = await User.register(user, password);
        req.login(user, function(err) {
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelp-Camp!');
            res.redirect('/campgrounds');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    let url = req.session.goto ? req.session.goto : '/campgrounds';
    res.redirect(url);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Hope to see you soon!');
    res.redirect('/campgrounds');
}