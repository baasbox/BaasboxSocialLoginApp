BaasboxSocialLoginApp
=====================

A simple proof of concept for baasbox social login functionality.

In a un*x environment you could add this function to your home .bash_profile 

  function server() {
      local port="${1:-8000}"
      sleep 1 && open "http://localhost:${port}/" &
      # Set the default Content-Type to `text/plain` instead of `application/octet-stream`
      # And serve everything as UTF-8 (although not technically correct, this doesn’t break anything for binary files)
      python -c $'import SimpleHTTPServer;\nmap = SimpleHTTPServer.SimpleHTTPRequestHandler.extensions_map;\nmap[""] = "    text/plain";\nfor key, value in map.items():\n\tmap[key] = value + ";charset=UTF-8";\nSimpleHTTPServer.test();' "$port"
  }

And after that invoke

  server .
  
To have an http server up and running
