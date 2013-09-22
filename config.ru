use Rack::Static, 
  :urls => [""],
  :root => ".",
  :index => "v2.html"

run lambda { |env|
  [
    200, 
    {
      'Content-Type'  => 'text/html', 
      'Cache-Control' => 'public, max-age=86400' 
    },
    File.open('v2.html', File::RDONLY)
  ]
}
