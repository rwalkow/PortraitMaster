const Photo = require('../models/photo.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const file = req.files.file;
    const { title, author, email } = req.fields;

    if (title && author && email && file) {
      // if fields are not empty...

      const authorPattern = new RegExp(/(<\s*(strong|em)*>(([A-z]|\s)*)<\s*\/\s*(strong|em)>)|(([A-z]|\s|\.)*)/,'g');
      const emailPattern = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,'g');
      const isAuthorValid = authorPattern.test(author);
      const isEmailValid = emailPattern.test(email);
      if (!isAuthorValid) {
        throw new Error('Author is not valid');
      } else if (!isEmailValid) {
        throw new Error('Email is not valid');
      }

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];
      if (
        (fileExt[1] === '.jpg' || '.png' || '.gif') && title.length <= 50 && author.length <= 50) {
        const newPhoto = new Photo({
          title,
          author,
          email,
          src: fileName,
          votes: 0,
        });

        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong file type!');
      }
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
