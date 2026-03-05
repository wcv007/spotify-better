import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

const uploadToCloudinary = async (file) => {
  // Simulating upload to Cloudinary and returning a URL
  // In real implementation, use Cloudinary SDK to upload and get the URL
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (err) {
    console.log("Error uploading to Cloudinary", err);
    throw new Error("Failed to upload file to Cloudinary");
  }
};
export const createSong = async (req, res, next) => {
  try {
    console.log("/admin/songs");
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res
        .status(400)
        .json({ message: "Please upload both audio and image files" });
    }
    const { title, artist, albumId, duration } = req.body;
    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    const audioUrl = await uploadToCloudinary(audioFile);
    const imageUrl = await uploadToCloudinary(imageFile);

    const song = new Song({
      title,
      artist,
      albumId: albumId || null,
      duration,
      audioUrl,
      imageUrl,
    });
    await song.save();
    // if song belongs to an album, update the album's songs array
    if (albumId) {
      await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id },
      });
    }
    res.status(201).json(song);
  } catch (err) {
    console.log("Error in createSong", err);
    next(err);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }
    // remove song from album's songs array if it belongs to an album
    if (song.albumId) {
      await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id },
      });
    }
    await Song.findByIdAndDelete(songId);
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (err) {
    console.log("Error in deleteSong", err);
    next(err);
  }
};

export const createAlbum = async (req, res, next) => {
  try {
    const { title, artist, releaseYear } = req.body;
    const { imageFile } = req.files;
    const imageUrl = await uploadToCloudinary(imageFile);
    const album = new Album({
      title,
      artist,
      releaseYear,
      imageUrl,
    });
    await album.save();
    res.status(201).json(album);
  } catch (err) {
    console.log("Error in createAlbum", err);
    next(err);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }
    // delete all songs associated with this album
    await Song.deleteMany({ albumId: id });
    await Album.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Album and associated songs deleted successfully" });
  } catch (err) {
    console.log("Error in deleteAlbum", err);
    next(err);
  }
};

export const checkAdmin = async (req, res, next) => {
  try {
    res.status(200).json({ admin: true });
  } catch (err) {
    console.log("Error in checkAdmin", err);
    next(err);
  }
};
