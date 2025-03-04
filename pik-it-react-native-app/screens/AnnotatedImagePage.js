import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

export default function AnnotatedImagePage({ route }) {
  const { imageUri, detections, objectToPhotograph } = route.params;
  console.log("1 : ", objectToPhotograph);
  const [objectDetected, setObjectDetected] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 1,
    height: 1,
    displayWidth: 1,
    displayHeight: 1,
  });
  const [selectedDetection, setSelectedDetection] = useState(null);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    Image.getSize(
      imageUri,
      (width, height) => {
        const scaledHeight = (screenWidth / width) * height;

        setImageDimensions({
          width,
          height,
          displayWidth: screenWidth,
          displayHeight: scaledHeight,
        });
      },
      (error) => {
        console.error("Erreur lors du chargement de l’image :", error);
      }
    );
  }, [imageUri]);
  // Vérifie si l'objet du jour est détecté parmi les objets
  useEffect(() => {
    const objectFound = detections.some(
      (detection) => detection.name === objectToPhotograph
    );
    console.log("2 : ",detections, "3 : ", objectToPhotograph);
    setObjectDetected(objectFound);
  }, [detections]);
  const [highlightAll, setHighlightAll] = useState(false);
  const getScaledCoordinates = (box) => {
    const [x1, y1, x2, y2] = box;
    const scaleX = imageDimensions.displayWidth / 3059.5;
    const scaleY = imageDimensions.displayHeight / 4079.5;

    return [x1 * scaleX, y1 * scaleY, x2 * scaleX, y2 * scaleY];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Annotée</Text>

      <View
        style={{
          width: imageDimensions.displayWidth,
          height: imageDimensions.displayHeight,
        }}
      >
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              width: imageDimensions.displayWidth,
              height: imageDimensions.displayHeight,
            },
          ]}
        />
        {/* Vérification de l'objet détecté */}
        <Text style={styles.objectStatus}>
          {objectDetected ? "Objet trouvé !" : "Objet non trouvé. Réessayez."}
        </Text>
        {imageDimensions.displayWidth > 1 &&
          imageDimensions.displayHeight > 1 && (
            <Svg
              width={imageDimensions.displayWidth}
              height={imageDimensions.displayHeight}
              style={styles.svg}
            >
              {detections.map((detection, index) => {
                const [scaledX1, scaledY1, scaledX2, scaledY2] =
                  getScaledCoordinates(detection.box);

                return (
                  <React.Fragment key={index}>
                    <Rect
                      x={scaledX1}
                      y={scaledY1}
                      width={scaledX2 - scaledX1}
                      height={scaledY2 - scaledY1}
                      stroke={selectedDetection === index ? "yellow" : "red"}
                      strokeWidth={selectedDetection === index ? 4 : 2}
                      fill="none"
                    />
                    <SvgText
                      x={scaledX1}
                      y={Math.max(scaledY1 - 5, 15)}
                      fontSize="14"
                      fill="red"
                      fontWeight="bold"
                    >
                      {`${detection.name} (${(detection.score * 100).toFixed(
                        1
                      )}%)`}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          )}
      </View>

      <Text style={styles.listTitle}>Objets détectés :</Text>

      <FlatList
        data={detections}
        keyExtractor={(item) => item.name + item.score}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => setSelectedDetection(index)}>
            <View
              style={[
                styles.listItem,
                selectedDetection === index && styles.selectedItem,
              ]}
            >
              <Text style={styles.objectName}>{item.name}</Text>
              <Text style={styles.probability}>
                {(item.score * 100).toFixed(1)}%
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  image: {
    backgroundColor: "#eee",
    alignSelf: "center",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
    marginTop: 5,
    width: "90%",
  },
  selectedItem: {
    backgroundColor: "#ffd700",
  },
  objectName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  probability: {
    fontSize: 16,
    color: "green",
  },
});
