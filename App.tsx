import {Button, StyleSheet, View} from 'react-native';
import {BPChannel, BPQLLabelSize, BPResolution, BrotherPrinterSDK, BPPrintSettings} from "expo-brother-printer-sdk";
import * as FileSystem from 'expo-file-system';
import {Asset} from 'expo-asset';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {useEffect} from "react";


const addImageToFiles = async (imgPath: any) => {
    const asset = Asset.fromModule(imgPath);
    await asset.downloadAsync();

    const localUri = `${FileSystem.documentDirectory}${asset.name}`;
    await FileSystem.copyAsync({from: asset.localUri, to: localUri});

    return localUri;
};

export default function App() {
    const [status, requestPermission] = ImagePicker.useCameraPermissions();

    useEffect(() => {
        const permission = requestPermission()
    }, []);

    const getAllPrinters = async (): Promise<BPChannel[]> => {
        const bluetoothPrinters = await BrotherPrinterSDK.searchBluetoothPrinters();
        const wifiPrinters = await BrotherPrinterSDK.searchNetworkPrinters({
            printerList: ["QL-820NWB"],
            searchDuration: 5000,
        });
        console.log(wifiPrinters);

        return [...bluetoothPrinters, ...wifiPrinters];
    };

    const printImage = async (channel: BPChannel, imageUri: string) => {
        const settings: BPPrintSettings = {
            labelSize: BPQLLabelSize.RollW62,
            autoCutForEachPageCount: 1,
            autoCut: true,
            cutAtEnd: true,
            resolution: BPResolution.Normal,
        };
        console.log(imageUri, channel, settings);
        return await BrotherPrinterSDK.printImage(imageUri, channel, settings);
    }

    return (
        <View style={styles.container}>
            <Button title={'test print'} onPress={async () => {
                const printers = await getAllPrinters();
                console.log('fetched printers:', printers);
                // const imageUri = await addImageToFiles(require('./assets/testbadge.png'));

                if (printers.length > 0) {
                    let image = await ImagePicker.launchImageLibraryAsync({
                        quality: 1,
                    });
                    const imageUri = image.assets[0].uri;
                    console.log('imageUri:', imageUri);
                    const testPrintResult = await printImage(printers[0], imageUri);
                    console.log('test print result', testPrintResult);
                } else {
                    console.log('no printers found');
                }

            }}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
