# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
project_path = File.join(File.dirname(__FILE__), "..", "..")
http_path = "/"
images_dir = "images"
javascripts_dir = "js"

# sass_path: the directory your Sass files are in. THIS file should also be in the Sass folder
# Generally this will be in a resources/sass folder
# <root>/resources/sass
sass_path = File.join(File.dirname(__FILE__), "..")

# css_path: the directory you want your CSS files to be.
# Generally this is a folder in the parent directory of your Sass files
# <root>/resources/css
css_path = File.join(sass_path, "..", "css")

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = :nested

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
