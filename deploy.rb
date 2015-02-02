#!/usr/bin/env ruby

# Enter login details here
url = ''
username = ''
password = ''
$webroot = ''

require 'net/sftp'

def log(s)
  STDERR.puts s
end

def mkdir_f(sftp, dir)
  sftp.mkdir! dir
rescue Net::SFTP::StatusException
  # directory already exists
end

def upload_rf(sftp, from, to)
  log "Uploading #{from} to #{to}"
  Dir.entries(from).each do |ent|
    next if %w{. .. .DS_Store .gitignore .git override deploy.rb}.include? ent
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

def upload_siftr(sftp, siftr)
  override_dir = "override/#{siftr}"
  remote_dir = if siftr == 'uw' then $webroot else "#{$webroot}/#{siftr}" end
  unless File.directory? override_dir
    log " => Error: #{override_dir} does not exist."
    exit 1
  end
  log " => Beginning deploy of #{siftr} siftr."
  log " => Ensuring remote dir #{remote_dir} exists..."
  mkdir_f sftp, $webroot
  mkdir_f sftp, remote_dir
  log ' => Uploading base repo...'
  upload_rf sftp, '.', remote_dir
  log " => Uploading #{siftr}-specific overrides..."
  upload_rf sftp, override_dir, remote_dir
  log ' => Done!'
end

all_siftrs = []
Dir.entries('override').each do |ent|
  next if %w{. ..}.include? ent
  next unless File.directory? "override/#{ent}"
  all_siftrs << ent
end

Net::SFTP.start(url, username, password: password) do |sftp|
  log " => Connected via SFTP."
  if ARGV == ['all']
    all_siftrs.each { |siftr| upload_siftr sftp, siftr }
  else
    ARGV.each { |siftr| upload_siftr sftp, siftr }
  end
end
