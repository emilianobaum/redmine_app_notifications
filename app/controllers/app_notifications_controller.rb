class AppNotificationsController < ApplicationController
  # helper :app_notifications
  # include AppNotificationsHelper
  helper :custom_fields
  helper :issues

  def index
    #@app_notifications = AppNotification.includes(:issue, :author, :journal, :kbarticle, :news).where(recipient_id: User.current.id).group('issue_id', 'article_id', 'news_id', 'is_tmp').order(is_tmp: :desc, days: :asc,created_on: :desc)
    @app_notifications = AppNotification.includes(:issue, :author, :journal, :news).where(recipient_id: User.current.id).order(is_tmp: :desc, days: :asc, created_on: :desc)
    if request.xhr?
      @app_notifications = @app_notifications.limit(5)
      render :partial => "ajax"
    end

    if !params.has_key?(:viewed) && !params.has_key?(:new) && !params.has_key?(:commit)
      @viewed = false
      @new = true
    else
      params.has_key?(:viewed) ? @viewed = params["viewed"] : @viewed = false
      params.has_key?(:new) ? @new = params["new"] : @new = false
    end

    if (!@viewed && !@new)
      return @app_notifications = []
    end
    if (@viewed != @new)
      @app_notifications = @app_notifications.where(viewed: true) if @viewed
      @app_notifications = @app_notifications.where(viewed: false) if @new
    end
    @limit = 10
    @app_notifications_pages = Paginator.new @app_notifications.count(:id), @limit, params["page"]
    @offset ||= @app_notifications_pages.offset
    @app_notifications = @app_notifications.limit(@limit).offset(@offset)
  end


  def view
    @notification = AppNotification.find(params[:id])

    if @notification.recipient == User.current
      if params[:mark_as_unseen]
        AppNotification.update(@notification.id, :viewed => false)
      else
        if !@notification.is_tmp
          @notices = AppNotification.where(recipient_id: @notification.recipient.id, viewed: false, is_tmp: false)
          if params[:issue_id]
            @notices = @notices.where(issue_id: @notification.issue.id).all
          elsif params[:news_id]
            @notices = @notices.where(news_id: @notification.news.id).all
          elsif params[:article_id]
            @notices = @notices.where(article_id: @notification.kbarticle.id).all
          else
            @notices = nil
          end
          if @notices
            @notices.update_all(:viewed => true)
          end
        else
          @notices = AppNotification.where(recipient_id: @notification.recipient.id, issue_id: @notification.issue.id, viewed: false, is_tmp: true).all
          if @notices
            @notices.update_all(:viewed => true)
          end
        end
      end
      if request.xhr?
        if @notification.is_edited?
          render :partial => "issues/issue_edit", :formats => [:html], :locals => { :issue => @notification.issue, :notification => @notification, :journal => @notification.journal }
        else
          render :partial => "issues/issue_add", :formats => [:html], :locals => { :issue => @notification.issue, :notification => @notification }
        end
      else
        if params[:issue_id]
          redirect_to :controller => "issues", :action => "show", :id => params[:issue_id], :anchor => params[:anchor]
        elsif params[:article_id]
          redirect_to :controller => "articles", :action => "show", :id => params[:article_id], :project_id => @notification.kbarticle.project, :anchor => params[:anchor]
        elsif params[:news_id]
          redirect_to :controller => "news", :action => "show", :id => params[:news_id], :anchor => params[:anchor]
        end
      end
    end
  end

  def view_all
    @notifications = AppNotification.where(:recipient_id => User.current.id, :viewed => false).update_all(:viewed => true)
    redirect_to :action => "index"
  end

  def unread_number
    @number = AppNotification.where(recipient_id: User.current.id, viewed: false).count
    render :json => @number
  end

  def live_notification_list
    @list = AppNotification.includes(:issue, :author, :journal, :news).where(recipient_id: User.current.id, viewed: false).order("created_on desc").limit(1)
    @new_list = []
    @list.each do |n|
      notify = { id: n.id }
      #logger.info("=============" + n.id.to_s);
      unless n.issue.nil?
        notify["icon"] = n.issue.author.avatar ? (url_for :only_path => false, :controller => "people", :action => "avatar", :id => n.issue.author.avatar, :size => 14) : "/plugin_assets/redmine_people/images/person.png"
        notify["title"] = n.issue.subject
        notify["url"] = url_for :controller => "app_notifications", :action => "view", :id => n.id, :issue_id => n.issue.id #, :anchor => "change-#{n.journal.id}"
      end
      unless n.kbarticle.nil?
        notify["icon"] = n.kbarticle.author.avatar ? (url_for :only_path => false, :controller => "people", :action => "avatar", :id => n.kbarticle.author.avatar, :size => 14) : "/plugin_assets/redmine_people/images/person.png"
        notify["title"] = n.kbarticle.title
        notify["url"] = url_for :controller => "app_notifications", :action => "view", :id => n.id, :article_id => n.kbarticle.id, :anchor => "change-#" + n.kbarticle.id
      end
      unless n.news.nil?
        notify["icon"] = n.news.author.avatar ? (url_for :only_path => false, :controller => "people", :action => "avatar", :id => n.news.author.avatar, :size => 14) : "/plugin_assets/redmine_people/images/person.png"
        notify["title"] = n.news.subject
        notify["url"] = url_for :controller => "app_notifications", :action => "view", :id => n.id, :news_id => n.news.id, :anchor => "change-#" + n.news.id
      end
      @new_list.append(notify)
    end
    render :json => @new_list
  end
end
