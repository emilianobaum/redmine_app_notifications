Redmine::Plugin.register :redmine_app_notifications do
  name "Redmine App Notifications plugin"
  author "David Robinson & Michal Vanzura"
  collaborators "Emiliano A. Baum"
  description "App notifications plugin provides simple in application notifications. It can replace default e-mail notifications. Adapted for Redmine 6.1.1"
  version "1.1.2"
  url "https://github.com/dr-consit/redmine_app_notifications"
  author_url "https://github.com/dr-consit"

  menu :top_menu, :app_notifications, { :controller => "app_notifications", :action => "index" }, {
    :caption => :notifications,
    :last => true,
    :if => Proc.new { User.current.app_notification },
    :html => { :id => "notificationsLink" },
  }

  settings :default => {
             "issue_added" => "on",
             "issue_updated" => "on",
             "issue_note_added" => "on",
             "issue_status_updated" => "on",
             "issue_assigned_to_updated" => "on",
             "issue_priority_updated" => "on",
             "faye_server_adress" => "http://ip_address_or_name_of_your_server:9292/faye",
           }, :partial => "settings/app_notifications_settings"
end
require_dependency File.expand_path('lib/app_notifications_hook_listener', __dir__)
require_dependency File.expand_path('lib/app_notifications_account_patch', __dir__)
require_dependency File.expand_path('lib/app_notifications_issues_patch', __dir__)
require_dependency File.expand_path('lib/app_notifications_journals_patch', __dir__)

<<<<<<< HEAD
require_relative "lib/app_notifications_hook_listener"
require_relative "lib/app_notifications_account_patch"
require_relative "lib/app_notifications_issues_patch"
require_relative "lib/app_notifications_journals_patch"
require_relative "lib/app_notifications_news_patch"
# require_dependency 'app_notifications_kbarticles_patch.rb'
=======
>>>>>>> 4caf8644ebd66863cba4d368fc321aadb6fbfadd
