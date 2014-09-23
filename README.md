# cldr-data-downloader

A Node.js download tool for [Unicode CLDR JSON][] data.

[Unicode CLDR JSON]: http://cldr.unicode.org/index/cldr-spec/json

## Usage

    $ npm install cldr-data-downloader

    $ node <<EOF
    cldrDownloader = require("cldr-data-downloader");
    cldrDownloader(
      "http://www.unicode.org/Public/cldr/26/json.zip",
      "./cldr",
      function(error) {
        if (error) {
          console.error("Whops", error.message);
          exit(1);
        }
        console.log("Done");
      }
    );
    EOF

    GET `http://www.unicode.org/Public/cldr/26/json.zip`
      [========================================] 100% 0.0s
    Received 3425K total.
    
    Unpacking it into ./cldr
    Done


## License

MIT © [Rafael Xavier de Souza](http://rafael.xavier.blog.br)
