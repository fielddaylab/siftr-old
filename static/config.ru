use Rack::Static, 
  :urls => ["/js", "/css", "/fonts"],
  :root => "."

run lambda { |env|
  [
    200, 
    {
      'Content-Type'  => 'text/html', 
      'Cache-Control' => 'public, max-age=86400' 
    },
    File.open('mobile.html', File::RDONLY)
  ]
}
