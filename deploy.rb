#!/usr/bin/env ruby

# Enter login details here
url = ''
username = ''
password = ''

require 'net/sftp'

def log(s)
  STDERR.puts s
end

base_dir = '.'
case ARGV.length
when 0
  siftr = 'uw'
  override_dir = "override/uw"
  remote_dir = "/httpdocs"
when 1
  siftr = ARGV[0]
  override_dir = "override/#{siftr}"
  remote_dir = "/httpdocs/#{siftr}"
else
  log "Usage: #{$0} siftr-name"
  exit 1
end

def mkdir_f(sftp, dir)
  sftp.mkdir! dir
rescue Net::SFTP::StatusException
  # directory already exists
end

def upload_rf(sftp, from, to)
  skip = %w{override .git}
  return if skip.any? { |s| from.end_with?('/' + s) }
  log "Uploading #{from} to #{to}"
  Dir.entries(from).each do |ent|
    next if %w{. ..}.include? ent
    full_from = "#{from}/#{ent}"
    full_to = "#{to}/#{ent}"
    if File.file?(full_from)
      begin
        sftp.remove! full_to
      rescue Net::SFTP::StatusException
        # file doesn't already exist
      end
      sftp.upload! full_from, full_to
    else
      mkdir_f sftp, full_to
      upload_rf sftp, full_from, full_to
    end
  end
end

unless File.directory?(override_dir)
  log "No override folder for #{siftr} found."
  exit 1
end

Net::SFTP.start(url, username, password: password) do |sftp|
  log " => Connected, beginning deploy of #{siftr} siftr."
  log " => Ensuring remote dir #{remote_dir} exists..."
  mkdir_f sftp, remote_dir
  log ' => Uploading base repo...'
  upload_rf sftp, base_dir, remote_dir
  log " => Uploading #{siftr}-specific overrides..."
  upload_rf sftp, override_dir, remote_dir
  log ' => Done!'
end
