include GravatarHelper::PublicMethods
include ERB::Util

class AppNotification < ActiveRecord::Base
  belongs_to :recipient, :class_name => "User", :foreign_key => "recipient_id"
  belongs_to :author, :class_name => "User", :foreign_key => "author_id"
  belongs_to :issue
  belongs_to :journal
  belongs_to :news
  belongs_to :kbarticle, :class_name => "KbArticle", :foreign_key => "article_id", :optional => true if defined?(KbArticle)

  def deliver
    unless Setting.plugin_redmine_app_notifications["faye_server_adress"].nil? || Setting.plugin_redmine_app_notifications["faye_server_adress"].empty?
      channel = "/notifications/private/#{recipient.id}"
      message = { :channel => channel, :data => { count: AppNotification.where(recipient_id: recipient.id, viewed: false).count, message: message_text, id: id, avatar: gravatar_url(author.mail, { :default => Setting.gravatar_default }) } }
      uri = URI.parse(Setting.plugin_redmine_app_notifications["faye_server_adress"])
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      request = Net::HTTP::Post.new(uri)
      request.set_form_data(:message => message.to_json)
      response = http.request(request)
      response
    end
  end

  def is_edited?
    journal.present?
  end

  def message_text
    if is_edited?
      I18n.t(:text_issue_updated, :id => "##{issue.id}", :author => author)
    else
      I18n.t(:text_issue_added, :id => "##{issue.id}", :author => author)
    end
  end

  def kbarticle
    return nil unless defined?(KbArticle)
    super
  end

  def similar_notices
    @notices = AppNotification.where(recipient_id: self.recipient.id, viewed: self.viewed, is_tmp: false)
    if not self.issue.nil?
      @notices = @notices.where(issue_id: self.issue.id).all
    elsif not self.news.nil?
      @notices = @notices.where(news_id: self.news.id).all
    elsif not self.kbarticle.nil?
      @notices = @notices.where(article_id: self.kbarticle.id).all
    else
      @notices = nil
    end
  end
end
