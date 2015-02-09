all: css/sifter-desktop.css css/sifter-mobile.css

css/%.css: css/%.less
	lessc "$<" "$@"
