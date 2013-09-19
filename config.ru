use Rack::Static, 
  :urls => ["/js", "/css", "/fonts", "/html5-crop-scale.html"],
  :root => "static"

run lambda { |env|
  [
    200, 
    {
      'Content-Type'  => 'text/html', 
      'Cache-Control' => 'public, max-age=86400' 
    },
    File.open('static/index.html', File::RDONLY)
  ]
}
