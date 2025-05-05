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
import { XCircle, CheckCircle } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AnnotatedImagePage({ route, navigation }) {
  const { imageUri, detections, objectToPhotograph } = route.params;
  const [detected, setDetected] = useState(false);
  const [dims, setDims] = useState({ w:1, h:1, dw:1, dh:1 });
  const [selected, setSelected] = useState(null);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    Image.getSize(
      imageUri,
      (w, h) => {
        const dw = SCREEN_WIDTH;
        const dh = (h / w) * SCREEN_WIDTH;
        setDims({ w, h, dw, dh });
      },
      console.error
    );
  }, [imageUri]);

  useEffect(() => {
    setDetected(
      detections.some(d => d.object_name === objectToPhotograph)
    );
  }, [detections, objectToPhotograph]);

  const scaleCoords = ([x1,y1,x2,y2]) => {
    const sx = dims.dw / 3060;
    const sy = dims.dh / 4080;
    return [x1*sx, y1*sy, x2*sx, y2*sy];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <XCircle size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Image Annotée</Text>
        <View style={{ width:24 }} />
      </View>

      <View style={[styles.imageWrapper, { width: dims.dw, height: dims.dh }]}>  
        <Image source={{ uri: imageUri }} style={{ width: dims.dw, height: dims.dh }} />
        <Svg width={dims.dw} height={dims.dh} style={StyleSheet.absoluteFill}>
          {detections.map((d,i) => {
            const [x1,y1,x2,y2] = scaleCoords(d.bbox.box);
            const isTarget = d.object_name === objectToPhotograph;
            return (
              <React.Fragment key={i}>
                <Rect
                  x={x1} y={y1}
                  width={x2-x1} height={y2-y1}
                  stroke={isTarget ? "#10B981" : selected===i?"#FBBF24":"#EF4444"}
                  strokeWidth={isTarget||selected===i?3:2}
                  fill="none"
                />
                <SvgText
                  x={x1} y={y1-4}
                  fontSize="12"
                  fill={isTarget?"#10B981":"#EF4444"}
                  fontWeight="600"
                >
                  {`${d.object_name} ${(d.confidence*100).toFixed(0)}%`}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      <View style={styles.statusRow}>
        {detected ? (
          <CheckCircle size={20} color="#10B981" />
        ) : (
          <XCircle size={20} color="#EF4444" />
        )}
        <Text style={[styles.statusText, detected?styles.success:styles.error]}>  
          {detected
            ? `Bravo ! ${objectToPhotograph} détecté !`
            : `Dommage, ${objectToPhotograph} non détecté.`}
        </Text>
      </View>

      {/* Retry Button */}
      <TouchableOpacity
        style={[styles.button, styles.retryButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Réessayer</Text>
      </TouchableOpacity>

      {/* Toggle List Button */}
      <TouchableOpacity
        style={[styles.button, styles.toggleButton]}
        onPress={() => setShowList(v=>!v)}
      >
        <Text style={styles.buttonText}>
          {showList ? "Masquer résultats" : "Voir tous"}
        </Text>
      </TouchableOpacity>

      {showList && (
        <View style={styles.listContainer}>
          <FlatList
            data={detections}
            keyExtractor={item=>item.id.toString()}
            renderItem={({item,index}) => (
              <TouchableOpacity onPress={()=>setSelected(index)}>
                <View style={[
                  styles.listItem,
                  selected===index && styles.listItemActive
                ]}>
                  <Text style={styles.itemName}>{item.object_name}</Text>
                  <Text style={styles.itemConf}>
                    {(item.confidence*100).toFixed(0)}%
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F3F4F6' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16 },
  headerTitle: { fontSize:18, fontWeight:'700', color:'#111827' },
  imageWrapper: { alignSelf:'center', backgroundColor:'#DDD', borderRadius:12, overflow:'hidden' },
  statusRow: { flexDirection:'row', alignItems:'center', padding:12 },
  statusText: { marginLeft:8, fontSize:14, fontWeight:'500' },
  success: { color:'#10B981' },
  error: { color:'#EF4444' },
  button: {
    marginHorizontal:16,
    marginVertical:8,
    paddingVertical:10,
    backgroundColor:'#EF4444',
    borderRadius:8,
    alignItems:'center'
  },
  retryButton: { backgroundColor:'#EF4444' },
  toggleButton: { backgroundColor:'#374151' },
  buttonText: { color:'#FFF', fontSize:16, fontWeight:'600' },
  listContainer: { flex:1, paddingHorizontal:16 },
  listItem: { flexDirection:'row', justifyContent:'space-between', padding:12, backgroundColor:'#FFF', borderRadius:8, marginBottom:8 },
  listItemActive: { backgroundColor:'#FEF3C7' },
  itemName: { fontSize:16, fontWeight:'600' },
  itemConf:{ fontSize:14, color:'#6B7280' }
});
