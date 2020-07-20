// get_gist_content.js -- Get @username #id gist content.

(function($, undefined) {

  $(document).ready(function() {
    var param = new UrlParam(window.location.search);
    var id = param.id;

    $.ajax({
      type: 'GET',
      url: GistAPI + '/gists/' + id,
      dataType: 'jsonp',
      success: function (gist) {
        // username and url
        $('.user')
          .append(gist.data.owner.login);

        // gist id and url
        $('.gistid')
          .attr('href', gist.data['html_url'])
          .text(gist.data.id);

        // gist date
        var date = moment(gist.data['updated_at']).format("YYYY MMM DD, h:mm a");
        $('.gist-date').text(date);

        // get title from title file (that shows up fist on gist.github.com)
        var title = 'gist - '
        for (var k in gist.data.files) {
          if (k[0] === ' ') {
            title += gist.data.files[k].content;
            break;
          }
        }
        document.title = title;

        // iframe demo
        var iframe = $('.gist-demo')[0];
        var doc = iframe.contentWindow || iframe.contentDocument;
        if (doc.document)
          doc = doc.document;
        doc.open();
        doc.write(gist.data.files['index.html'].content);
        doc.close();

        // gist readme, parsed with marked.js
        $('.gist-readme')
          .append($('<h2>').text("README"))
          .append(marked(gist.data.files['README.md'].content));

        // gist sources
        var $sources = $('.gist-sources');

        var helper = function (k, v) {
          $('<div>')
            .addClass('gist-source')
            .append($('<h2>').append(k))
            .append($('<pre>')
                    .html($('<code>').text(v.content))
                    .each(function(i, e) {hljs.highlightBlock(e);}))
            .appendTo($sources);
        };

        var fileLookup = {};

        // then index.html (if not minified)
        var isIndexHtmlMinified = false;
        try {
          var pkg = gist.data.files['package.json']
          if (pkg.content.indexOf('indexhtmlify') !== -1) {
            isIndexHtmlMinified = true;
          }
        } catch(e) {}
        if (!isIndexHtmlMinified) {
          fileLookup['index.html'] = gist.data.files['index.html'];
        }

        var fileList = Object.keys(gist.data.files).sort();
        var badList = ['README.md', 'thumbnail.png', 'preview.gif', '.gitignore', '.block',
                       'package.json', 'package-lock.json'];
        for (var i = 0; i < fileList.length; i++) {
          var k = fileList[i]
          if (fileLookup[k]) continue;
          if (k[0] === ' ') continue;
          if (badList.indexOf(k) !== -1) continue;
          if (isIndexHtmlMinified && k === 'index.html') continue;
          fileLookup[k] = gist.data.files[k];
        }

        // then comes the package.json
        if ('package.json' in gist.data.files) {
          fileLookup['package.json'] = gist.data.files['package.json']
        }

        // minified index.html comes last
        if (isIndexHtmlMinified) {
          fileLookup['index.html'] = gist.data.files['index.html'];
        }

        $.each(fileLookup, helper);
      }
    });

  });

})(jQuery);
