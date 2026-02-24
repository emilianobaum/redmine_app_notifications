# Redmine App Notifications

App notifications plugin provides simple in application notifications for Redmine. It can replace default e-mail notifications.

## Installation and Setup

1. Follow the Redmine plugin installation steps at: http://www.redmine.org/wiki/redmine/Plugins.
2. Run the plugin migrations `rake redmine:plugins:migrate RAILS_ENV=production`.
3. Optional - Only needed if you want to use Faye for server to client notifications (websocket).
  1. If you want to use thin as the websocket server install the Thin server `gem install thin`. Otherwise configure faye.ru according to the server you use (e.g. Passenger). See https://github.com/faye/faye-websocket-ruby#running-your-socket-application for more details.
  2. Modify `/etc/init.d/faye_for_redmine` to at least fill the right value for `IN_APP_NOTIFICATION_ROOT_PATH`.
  3. To setup the faye websocket server as a service copy the `faye_for_redmine` file to `/etc/init.d`.
  4. To have the faye websocket server start at boot `cd /etc/init.d && update-rc.d faye_for_redmine defaults`.
  5. Start the Faye websocket server `service faye_for_redmine start` (you can stop it with `stop` instead of `start`).
  6. After number 5 below - in Administration > Plugins > Configure, modify `ip_address_or_name_of_your_server` to match your server IP address or name.
4. Restart your Redmine web server.
5. Login and configure the plugin (Administration > Plugins > Configure).
6. Dis/Enable In App Notifications in user account settings -> preferences.
