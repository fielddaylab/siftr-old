# Run 'make' to rebuild less into css.
all: css/sifter-desktop.css css/sifter-mobile.css

css/%.css: css/%.less
	lessc --no-color "$<" "$@"
