const Background = class {
  constructor(input_el) {
    this.input_el = input_el;

    this.valid_types = ['image/png', 'image/jpeg'];

    this.type_error = 'Allowed file types: ' + this.valid_types.join(', ');
    this.type_error = 'File is too large. Max size allowed: 3 MB';
    this.idx_not_found = 'File not saved';

    this.input_el.addEventListener('change', (e) => {
      this.handleUserFiles(e.currentTarget.files);
    });

    this.images = this.getImages();

    this.current_bg_idx = this.getCurrentBgIdx();

    if ( this.current_bg_idx !== null ) {
      this.set(this.current_bg_idx);
    }
  }

  getImages() {
    let images = localStorage.getItem('background-images');

    if (images) {
      images = JSON.parse(images);
    }

    return images || [];
  }

  getCurrentBgIdx() {
    return localStorage.getItem('current-background-idx');
  }

  setCurrentBgIdx(idx) {
    localStorage.setItem('current-background-idx', idx);
    return this;
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

      const name = filelist[i].name;
      
      reader.onloadend = () => {
        images.push({ name, data: reader.result });

        if ( i == (filelist.length - 1) ) {
          this.save(images);
        }
      };

      reader.onerror = (e) => {
        console.error(e);
        console.error('Error saving file: ' + name);
      };

      reader.readAsDataURL(filelist[i]);
    }
  }

  add() {
    this.input_el.click();

    return this;
  }

  save(images) {
    let storedImages = this.getImages();

    images = JSON.stringify([ ...storedImages, ...images ]);

    localStorage.setItem('background-images', images);
    
    return this;
  }

  get(idx) {
    const images = this.getImages();

    if ( !images || !images.length || !images[idx] ) {
      throw new Error(this.idx_not_found);
    }

    return images[idx];
  }

  set(idx) {
    const img = this.get(idx);
    const base64 = img.data;

    if ( this.current_bg_idx !== idx ) {
      this.setCurrentBgIdx(idx);
    }

    console.log(`Set background to: ${img.name} (${idx})`);

    document.body.style.background = `url(${base64})`;
  }

  setRandom() {

  }
};

export { Background };