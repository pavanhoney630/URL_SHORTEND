URL_SHORTEND //Project Name

Demo CRED: Useremail :rithik123@gmail.com, Pswdd: rithik

Features implemented in this projects as follows
Signup //
user can signup in this design by giving the data like Name, email, mobile,password.

Login //

user can login directly if he has exisisting account by giving email and password.

Password hash //
For security reasons of user's data, their password stored as hashed string in the database. It provides lot more protection to their user's information.

Dashboard //

Coming to the actual part of the project is user's dasboard, when any user is logged in with their info this project implementation will analsye the user information and user name and it will greet the user according to the day and night session along with day and date including time and it will create a profileIcon of initials of user name.

In the dashboard user can get the aggregated clicks count of total clicks of the created urls and also day to day click count with respective device counts also. we can view this data by Bar graphical representaion.

Mainly this dashboard contain side bar with tabs Dashboard which already discussed above, Links tab, Analytics Tab, Settings tab.

Links Tab,

when we routed to Links so here user can have the option to create New shortendUrl of original Url, and for searching purpose we have filter options for searching with remarks, shortlink and original link filters, also this have the sorting capacity for Timestamp and shortend url columns.

Every time an ShortendUrl is visited one click count will be updated.

In this we can also able to edit the url and also delete the url created by the user.

Analytics //

Despite incresing the click count this design has ability to get the Url visit time by any one which created by user and the visitor's IP Adress, visit of time and os using by user, also the device type. (got this device type in design by using (user-agent parser)).

Settings //

In the settings page we have the functionality like updating the username mobile and email.

Key Points //

*All the Data is meant to be stored in the database and i designed like this to render data dynamically from backend fetching from the the database.
*main Routes of the design is /signup, /login, /dashboard, /dashboard/links, /dashboard/analytics, /dashboard/settings.
