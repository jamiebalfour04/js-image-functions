/*
Jamie Balfour. 2016
*/

var BalfJSTools = function() {
  BalfJSTools.SetSessionCookie = function(name, value) {
    document.cookie = name + "=" + value + "; path=/";
  };

	return {
	  image : {
	    //Limits to 255
	    tools : {
	      imageDataToImageTag : function(image_data, img_tag) {
	        var canvas = document.createElement("canvas");
	        canvas.setAttribute("width", image_data.width);
	        canvas.setAttribute("height", image_data.height);
	        var ctx = canvas.getContext("2d");
	        ctx.putImageData(image_data, 0, 0);
	        if (img_tag instanceof HTMLElement) {
	          img_tag.setAttribute("src", canvas.toDataURL());
	          return true;
	        }
	        return false;
	      },

	      canvasLoadImageFromURL : function(link, canvas_context) {
	        var img = document.createElement("img");
	        img.setAttribute("src", link);
	        //Wait until it's finished loading
	        img.onload = function() {
	          canvas_context.drawImage(img, 0, 0);
	        }
	      },

	      limitToColour : function(colour) {
	        if (colour > 255) {
	          return 255;
	        }
	        if (colour < 0) {
	          return 0;
	        }
	        return colour;
	      },

	      //Specific for <img> tags
	      imageDataFromImageTag : function(img) {
	        var canvas = document.createElement("canvas");
	        var ctx = canvas.getContext("2d");
	        ctx.drawImage(img, 0, 0);

	        var content = ctx.getImageData(0, 0, 500, 500);

	        return content;
	      }

	    },

	    effects : {
	      iterateImage : function(image_data, application) {
	        var pix = image_data.data;
	        for (var i = 0, n = pix.length; i < n; i += 4) {
	          var pixel = new Object();

	          pixel.R = pix[i];
	          pixel.G = pix[i + 1];
	          pixel.B = pix[i + 2];
	          pixel.A = pix[i + 3];

	          var x = application(pixel);

	          pix[i] = x.R;
	          pix[i + 1] = x.G;
	          pix[i + 2] = x.B;
	          pix[i + 3] = x.A;
	        }

	        return image_data;
	      },
	      invertColour : function(image_data) {
	        return BalfJSTools.Image.Effects.IterateImage(image_data, function(pixel) {

	          pixel.R = 255 - pixel.R;
	          pixel.G = 255 - pixel.G;
	          pixel.B = 255 - pixel.B;

	          return pixel;
	        });
	      },
	      grayscale : function(image_data) {
	        return BalfJSTools.Image.Effects.IterateImage(image_data, function(pixel) {

	          var clr = (0.3 * pixel.R) + (0.5 * pixel.G) + (0.2 * pixel.B);

	          pixel.R = clr;
	          pixel.G = clr;
	          pixel.B = clr;

	          return pixel;
	        });
	      },
	      sepia : function(image_data) {
	        return BalfJSTools.Image.Effects.IterateImage(image_data, function(pixel) {

	          //Red
	          var clr = (0.393 * pixel.R) + (0.769 * pixel.G) + (0.189 * pixel.B);
	          pixel.R = BalfJSTools.Image.Tools.LimitToColour(clr);
	          //Green
	          var clg = (0.349 * pixel.R) + (0.686 * pixel.G) + (0.168 * pixel.B);
	          pixel.G = BalfJSTools.Image.Tools.LimitToColour(clg);
	          //Blue
	          var clb = (0.272 * pixel.R) + (0.534 * pixel.G) + (0.131 * pixel.B);
	          pixel.B = BalfJSTools.Image.Tools.LimitToColour(clb);

	          return pixel;
	        });
	      },
	      blackAndWhite : function(image_data) {
	        return BalfJSTools.Image.Effects.IterateImage(image_data, function(pixel) {

	          var total = pixel.R + pixel.G + pixel.B;

	          var output = 0;
	          if (total > 383) {
	            output = 255;
	          }

	          pixel.R = output;
	          pixel.G = output;
	          pixel.B = output;

	          return pixel;
	        });
	      },
	      floodFill : function(image_data, x, y, colour) {
	        console.log("This function is not ready yet.");
	        //return;
	        var pix = image_data.data;

	        var new_pos = 0;
	        var row_width = image_data.width * 4;

	        function translateXandY(ix, iy) {
	          var a = ix;
	          var b = iy;


	          var cPos = 4 * a;
	          var rPos = row_width * b;

	          return rPos + cPos;
	          //return ((a * b) * 4);


	        }

	        newPos = translateXandY(x, y);


	        var initialColour = new Object();
	        initialColour.R = pix[newPos];
	        initialColour.G = pix[newPos + 1];
	        initialColour.B = pix[newPos + 2];

	        function checkTolerance(tol, pixel, top) {
	          if (pixel <= top + tol && pixel >= top - tol) {
	            return true;
	          }
	          return false;
	        }

	        function innerFunction(x, y, type) {
	          //Check this pixel matches
	          var i = translateXandY(x, y);
	          var tolerance = 10;

	          var rTol = checkTolerance(tolerance, pix[i], initialColour.R);
	          var gTol = checkTolerance(tolerance, pix[i + 1], initialColour.G);
	          var bTol = checkTolerance(tolerance, pix[i + 2], initialColour.B);

	          if (rTol && gTol && bTol) {
	            //console.log(x + " " + y);

	            //if(pix[i] == 0)
	            //console.log(i + " " + pix[i] + " " + pix[i+1] + " " + pix[i+2]);
	            //console.log(pix[i] + " " + pix[i+1] + " " + pix[i+2]);
	            pix[i] = colour.R;
	            pix[i + 1] = colour.G;
	            pix[i + 2] = colour.B;
	            //console.log(pix[i] + " " + pix[i+1] + " " + pix[i+2]);

	            //To the left
	            if (x - 1 > -1 && type != "right") {
	              innerFunction(x - 1, y, "left");
	            }
	            //To the right
	            if (x + 1 < image_data.width && type != "left") {
	              innerFunction(x + 1, y, "right");
	            }
	            //To the top
	            if (y - 1 > -1 && type != "bottom") {
	              innerFunction(x, y - 1, "top");
	            }
	            //To the bottom
	            if (y + 1 < image_data.height && type != "top") {
	              innerFunction(x, y + 1, "bottom");
	            }
	          }
	        }

	        innerFunction(x, y, "");

	        return image_data;

	      },
	      darken : function(image_data) {
	        return BalfJSTools.Image.Effects.IterateImage(image_data, function(pixel) {

	          function Limiter(colour) {
	            if (colour > 255) {
	              return 255;
	            }
	            if (colour < 0) {
	              return 0;
	            }
	          }

	          //Red
	          var clr = (0.393 * pixel.R) + (0.769 * pixel.G) + (0.189 * pixel.B);
	          pixel.R = Limiter(clr);
	          //Green
	          var clg = (0.349 * pixel.R) + (0.686 * pixel.G) + (0.168 * pixel.B);
	          pixel.G = Limiter(clg);
	          //Blue
	          var clb = (0.272 * pixel.R) + (0.534 * pixel.G) + (0.131 * pixel.B);
	          pixel.B = Limiter(clb);


	          return pixel;
	        });
	      }
	    }
	  }
	};
}
