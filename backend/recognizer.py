import keras 
from tensorflow.keras.preprocessing import image
import numpy as np
import os 


def preprocess_input(input_path):
    new_image_path = '../resource/test_faces/test_1.jpg' # placeholder input path

    # Define target size for the image (same as used for training)
    IMG_WIDTH = 224
    IMG_HEIGHT = 224

    try:
        # Load the image
        img = image.load_img(new_image_path, target_size=(IMG_WIDTH, IMG_HEIGHT))
        # Convert the image to a numpy array
        img_array = image.img_to_array(img)
        # Expand dimensions to create a batch of 1 image
        img_array = np.expand_dims(img_array, axis=0)
        # Apply ResNet preprocessing
        preprocessed_img = keras.applications.resnet.preprocess_input(img_array)

        print(f"New image '{new_image_path}' loaded and preprocessed successfully.")
        print(f"Shape of preprocessed image: {preprocessed_img.shape}")
        return preprocessed_img

    except FileNotFoundError:
        print(f"Error: The image file was not found at '{new_image_path}'.")
        print("Please ensure the path is correct and the file exists.")
        
        # List contents of the directory to help debug
        image_directory = os.path.dirname(new_image_path)
        print(f"\nListing contents of directory '{image_directory}':")
        if os.path.exists(image_directory):
            files = os.listdir(image_directory)
            print("Files in directory:", files)
        else:
            print(f"Directory '{image_directory}' does not exist.")

    except Exception as e:
        print(f"An error occurred during image loading or preprocessing: {e}")

def load_model():
    # Define the path to your saved model
    model_save_path = '../resource/models/resnet_152_model.keras'

    # Load the entire model
    loaded_model = keras.models.load_model(model_save_path)

    print(f"Model loaded successfully from: {model_save_path}")
    print(loaded_model.summary())
    return loaded_model

def make_prediction(model, processed_input):
    # Ensure the preprocessed_img exists before trying to predict
    if preprocess_input is not None:
        # Make a prediction using the loaded model
        predictions = model.predict(processed_input)

        # Get the index of the predicted class
        predicted_class_idx = np.argmax(predictions[0])
        # Get the probability of the predicted class
        predicted_probability = np.max(predictions[0])

        train_generator_class_indices = {
            'Akshay Kumar': 0, 'Alexandra Daddario': 1, 'Alia Bhatt': 2, 'Amitabh Bachchan': 3,
            'Andy Samberg': 4, 'Anushka Sharma': 5, 'Billie Eilish': 6, 'Brad Pitt': 7,
            'Camila Cabello': 8, 'Charlize Theron': 9, 'Claire Holt': 10, 'Courtney Cox': 11,
            'Dwayne Johnson': 12, 'Elizabeth Olsen': 13, 'Ellen Degeneres': 14, 'Henry Cavill': 15,
            'Hrithik Roshan': 16, 'Hugh Jackman': 17, 'Jessica Alba': 18, 'Kashyap': 19,
            'Lisa Kudrow': 20, 'Margot Robbie': 21, 'Marmik': 22, 'Natalie Portman': 23,
            'Priyanka Chopra': 24, 'Robert Downey Jr': 25, 'Roger Federer': 26, 'Tom Cruise': 27,
            'Vijay Deverakonda': 28, 'Virat Kohli': 29, 'Zac Efron': 30
        }

        # Retrieve class names from this dictionary
        # First, reverse the class_indices dictionary to map index to name
        class_names = {v: k for k, v in train_generator_class_indices.items()}

        # Get the predicted class name
        predicted_class_name = class_names[predicted_class_idx]

        print(f"\nPrediction for the new image:")
        print(f"Predicted Class: {predicted_class_name}")
        print(f"Confidence: {predicted_probability:.2f}")

        return predicted_class_name, predicted_probability
    else:
        print("Cannot make prediction: No image was loaded or preprocessed successfully.")
        return 
    
# model = load_model()
# input = preprocess_input("")
# make_prediction(model, input)