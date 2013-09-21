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

    server

from the root folder of the javascript app
  
To have an http server up and running (on port 8000)  on the current folder

## App parameters

To make things work you should add into your */etc/hosts/* file (if in a linux environment) an entry to redirect traffic to a specific server name to localhost: i.e. if you add this line

    127.0.0.1	baasbox-local.com

and start the server for the app you could access this with localhost:8000 or baasbox-local.com:8000

If you open the app.js file inside the js/app folder you should see a section for the declaration of constants:

    window.app.constant("serverUrl","http://<your server url>:9000");						
    window.app.constant("baseServerUrl","http://<your server url>:9000\:9000");
    window.app.constant("baseClientUrl","http://<your server url>:8000\:8000");
    window.app.constant("facebookAppId","<fb app id>");
    window.app.constant("googleAppId","<g+ app id>");

where
<your server url> is the entry you put into the /etc/hosts file i.e
    window.app.constant("serverUrl","http://<your server url>:9000");

<fb app id> is the key that facebook gives you when creating an app
<g+ app id> is the key that g+ gives you when creating an app

##Windows users
Coming soon...
