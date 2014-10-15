#!/usr/bin/env ruby

# Enter login details here
url = ''
username = ''
password = ''

require 'net/sftp'

def log(s)
  STDERR.puts s
end

if ARGV.length != 1
  log "Usage: #{$0} siftr-name"
  exit 1
end
siftr = ARGV[0]

base_dir = '.'
override_dir = "override/#{siftr}"
remote_dir = "/httpdocs/#{siftr}"

def rm_rf(sftp, dir)
  log "Removing directory #{dir}"
  sftp.dir.entries(dir).each do |ent|
    next if %w{. ..}.include? ent.name
    full = "#{dir}/#{ent.name}"
    if ent.file?
      sftp.remove! full
    else
      rm_rf sftp, full
    end
  end
  sftp.rmdir! dir
rescue Net::SFTP::StatusException
  # if the directory doesn't exist
end

def upload_rf(sftp, from, to)
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
      begin
        sftp.mkdir! full_to
      rescue Net::SFTP::StatusException
        # dir doesn't already exist
      end
      upload_rf sftp, full_from, full_to
    end
  end
end

unless File.directory?(override_dir)
  log "No override folder for #{siftr} found."
  exit 1
end

Net::SFTP.start(url, username, password: password) do |sftp|
  log "==> Connected, beginning deploy of #{siftr} siftr."
  log '==> Removing existing directory...'
  rm_rf sftp, remote_dir
  log '==> Making new empty directory...'
  sftp.mkdir! remote_dir
  log '==> Uploading base repo...'
  sftp.upload! base_dir, remote_dir
  log "==> Uploading #{siftr}-specific overrides..."
  upload_rf sftp, override_dir, remote_dir
  log '==> Done!'
end
