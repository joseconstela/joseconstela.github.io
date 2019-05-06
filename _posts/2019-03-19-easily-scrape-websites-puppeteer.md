---
layout: post
title:  "Easily scrape websites using Puppeteer and YAML definitions"
date:   2019-03-09 18:20:10 +0200
---

In this post, I’m introducing a new npm package called WebParsy:

> WebParsy is a [NodeJS library](https://github.com/joseconstela/webparsy#library) and cli (a terminal application) that scrapes websites using Puppeteer and YAML definitions [https://www.npmjs.com/package/webparsy](https://www.npmjs.com/package/webparsy)

Basically it allows anyone to scrape any content from any website, very easily.

But not only that. It can also perform logins, take screeenshots, create PDF files, etc.

### Installing Webarsy



> WebParsy is available in the NPM official repository. Make sure you have installed a recent version of [NodeJS](https://nodejs.org/).

To install it simply do:

    npm i webparsy -g

### Usage

> There are examples that covers all WebParsy possibilities on its Github repository: [https://github.com/joseconstela/webparsy/tree/master/example](https://github.com/joseconstela/webparsy/tree/master/example)

#### The YAML file

The first thing you need to do is to create a YAML file.

> A YAML file is a human-readable set of data that both humans and computers can easily read through.

This is where you tell WebParsy the steps if must follow, which websites visit, what contents you need and where it can find them.

It can also contain some basic _configuration_ parameters like the browser’s width and height, etc.

Below is the most basic content that your definition must contain:

    jobs:
      main:
        steps:
          - goto: <a website URL>

#### Add the steps

This is where you become a magician. At the moment of writing, WebParsy supports the following steps:

*   [goto](https://github.com/joseconstela/webparsy#goto) Navigate to an URL
*   [goBack](https://github.com/joseconstela/webparsy#goBack) Navigate to the previous page in history
*   [screenshot](https://github.com/joseconstela/webparsy#screenshot) Takes an screenshot of the page
*   [pdf](https://github.com/joseconstela/webparsy#pdf) Takes a pdf of the page
*   [text](https://github.com/joseconstela/webparsy#text) Gets the text for a given CSS selector
*   [title](https://github.com/joseconstela/webparsy#title) Gets the title for the current page.
*   [form](https://github.com/joseconstela/webparsy#form) Fill and submit forms
*   [html](https://github.com/joseconstela/webparsy#html) Return HTML code for the page or a DOM element

Each one of this can be defined in the `steps` section of the file. Take a look to the documentation for how to use each one of them.

To cover the example of this post, we will grab [Madrid’s temperature from weather.com](https://weather.com/es-ES/tiempo/hoy/l/SPXX0050:1:SP).

The first thing the scraper must do is visit their website. The first step of the process would be:

    - goto: https://weather.com/es-ES/tiempo/hoy/l/SPXX0050:1:SP

The next thing to worry about is to tell the scraper where’s the city’s temperature in the web page.

![](/images/scraping-temperature.png)

You must help yourself to get the CSS selectors for the details you want to grab by using the browser’s dev tools.

For the case of weather.com, the CSS selector to grab the temperature is `.today_nowcard-temp span`. Since all scraped information is treated as text strings, we want the temperature to be returned as a number. WebParsy can cast this to a number, getting rid of the ° symbol for you. To do this you can make use of `type`.

> WebParsy can both [transform](https://github.com/joseconstela/webparsy#transform) and [cast (type)](https://github.com/joseconstela/webparsy#types) before returning the scraper details.

The step will look like:

          - text:
              selector: .today_nowcard-temp span
              type: number
              as: temp

`as` represents the name of the property to be returned.

Your YAML file should now look like

    jobs:
      main:
        steps:
          - goto: https://weather.com/es-ES/tiempo/hoy/l/SPXX0050:1:SP
          - text:
              selector: .today_nowcard-temp span
              type: number
              as: temp

#### Execute

Simply do:

    webparsy <your yaml file>

The command’s result should like as:

    $ webparsy mi_file.yaml
    {
      "temp": 16
    }

### Learn more about WebParsy

Although WebParsy might not suite everyone’s needs, it’s under active development and accepting all kind of suggestions. Take a look to the repository at [https://github.com/joseconstela/webparsy](https://github.com/joseconstela/webparsy) and submit any issue you might experience.

You can also contribute with your pull requests and forking the repository.

### License

MIT