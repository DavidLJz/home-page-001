const Background = class {
  constructor(input_el) {
    this.input_el = input_el;

    this.valid_types = ['image/png', 'image/jpeg'];

    this.type_error = 'Error: Allowed file types: ' + this.valid_types.join(', ');
    this.type_error = 'Error: File is too large. Max size allowed: 3 MB';
    this.idx_not_found = 'Error: File not saved';

    this.input_el.addEventListener('change', (e) => {
      this.handleUserFiles(e.currentTarget.files);
    });

    this.images = this.getImages();
  }

  getImages() {
    let images = localStorage.getItem('background-images');

    if (images) {
      images = JSON.parse(images);
    }

    return images;
  }

  handleUserFiles(filelist) {
    filelist = Array.from(filelist);

    console.log(filelist);

    const images = [];
    const reader = new FileReader();

    for (const i in filelist) {
      if ( !this.valid_types.includes(filelist[i].type) ) {
        alert(this.type_error);
        console.error(this.type_error);
        return;
      }

      if ( filelist[i].size / 1000000 > 3 ) {
        alert(this.size_error);
        console.error(this.size_error);
        return;
      }
      
      reader.onloadend = () => {
        images.push(reader.result);

        if ( i == (filelist.length - 1) ) {
          this.save(images);
        }
      };

      reader.readAsDataURL(filelist[i]);
    }
  }

  add() {
    this.input_el.click();

    return this;
  }

  save(images) {
    images = JSON.stringify([ ...this.getImages(), ...images ]);

    localStorage.setItem('background-images', images);
    
    return this;
  }

  get(idx) {
    const images = this.getImages();

    if ( !images.length || !images[idx] ) {
      throw new Error(this.idx_not_found);
    }

    return images[idx];
  }

  setRandom() {

  }
};

export { Background };