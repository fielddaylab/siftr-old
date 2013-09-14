use Rack::Static, 
  :urls => ["/js", "/css", "/fonts"],
  :root => "static"

run lambda { |env|
  [
    200, 
    {
      'Content-Type'  => 'text/html', 
      'Cache-Control' => 'public, max-age=86400' 
    },
    File.open('static/mobile.html', File::RDONLY)
  ]
}
