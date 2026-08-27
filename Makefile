.PHONY: all pdf clean

PDF_TARGET = 我的女友景甜.pdf
BUILD_DIR = build
MAIN_TEX = main.tex

all: pdf

pdf: $(MAIN_TEX)
	@mkdir -p $(BUILD_DIR)
	xelatex -interaction=nonstopmode -halt-on-error -output-directory=$(BUILD_DIR) $(MAIN_TEX)
	xelatex -interaction=nonstopmode -halt-on-error -output-directory=$(BUILD_DIR) $(MAIN_TEX)
	cp $(BUILD_DIR)/main.pdf ./$(PDF_TARGET)
	@echo "Build successful: $(PDF_TARGET)"

clean:
	rm -rf $(BUILD_DIR)
