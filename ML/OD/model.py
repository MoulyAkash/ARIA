# import torch
# import uuid
# from ultralytics import yolo
# def runModel(img):
#     model = torch.hub.load('ultralytics/yolov5', 'yolov5m')
#     # img = 'https://i.ytimg.com/vi/q71MCWAEfL8/maxresdefault.jpg'  # or file, Path, PIL, OpenCV, numpy, list
#     results = model(img)
#     results.print()
#     results.save(save_dir='results')

# runModel('https://i.ytimg.com/vi/q71MCWAEfL8/maxresdefault.jpg')

from ultralytics import YOLO

# Load a model
model = YOLO("yolov8n.yaml")  # build a new model from scratch
model = YOLO("yolov8n.pt")  # load a pretrained model (recommended for training)

# Use the model
model.train(data="coco128.yaml", epochs=3)  # train the model
metrics = model.val()  # evaluate model performance on the validation set
results = model("https://ultralytics.com/images/bus.jpg%22")  # predict on an image
success = model.export(format="onnx")  # export the model to ONNX format